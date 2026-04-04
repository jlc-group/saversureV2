package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	ctx := context.Background()

	// Connect to database using .env credentials
	dbURL := "postgres://saversure_app:julaherb789@192.168.0.60:5433/saversure?sslmode=disable"

	db, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("DB Error: %v", err)
	}
	defer db.Close()

	fmt.Println("=== ตรวจสอบรายการแลกแต้มทั้งหมดในระบบ ===\n")

	// Query all redemption transactions
	query := `
		SELECT 
			rr.id,
			rr.user_id,
			COALESCE(u.display_name, u.first_name, '') as user_name,
			rr.reward_id,
			COALESCE(r.name, 'Unknown Reward') as reward_name,
			rr.status,
			rr.fulfillment_status,
			rr.tracking_number,
			rr.delivery_type,
			rr.coupon_code,
			rr.created_at,
			rr.confirmed_at
		FROM reward_reservations rr
		LEFT JOIN users u ON u.id = rr.user_id
		LEFT JOIN rewards r ON r.id = rr.reward_id
		WHERE rr.status = 'CONFIRMED'
		ORDER BY rr.created_at DESC
	`

	rows, err := db.Query(ctx, query)
	if err != nil {
		log.Fatalf("Query error: %v", err)
	}
	defer rows.Close()

	type Redemption struct {
		ID                string
		UserID            string
		UserName          string
		RewardID          string
		RewardName        string
		Status            string
		FulfillmentStatus *string
		TrackingNumber    *string
		DeliveryType      *string
		CouponCode        *string
		CreatedAt         time.Time
		ConfirmedAt       *time.Time
	}

	var redemptions []Redemption
	for rows.Next() {
		var r Redemption
		err := rows.Scan(
			&r.ID, &r.UserID, &r.UserName, &r.RewardID, &r.RewardName,
			&r.Status, &r.FulfillmentStatus, &r.TrackingNumber, &r.DeliveryType,
			&r.CouponCode, &r.CreatedAt, &r.ConfirmedAt,
		)
		if err != nil {
			log.Printf("Scan error: %v", err)
			continue
		}
		redemptions = append(redemptions, r)
	}

	if len(redemptions) == 0 {
		fmt.Println("❌ ไม่พบรายการแลกแต้มที่ยืนยันแล้ว")
		return
	}

	fmt.Printf("📦 จำนวนรายการแลกแต้มทั้งหมด: %d รายการ\n\n", len(redemptions))

	// Group by user
	userRedemptions := make(map[string][]Redemption)
	for _, r := range redemptions {
		userRedemptions[r.UserID] = append(userRedemptions[r.UserID], r)
	}

	fmt.Println("=== รายการแยกตามผู้ใช้ ===")
	for userID, userReds := range userRedemptions {
		userName := userReds[0].UserName
		if userName == "" {
			userName = "ไม่ทราบชื่อ"
		}

		fmt.Printf("\n👤 ผู้ใช้: %s (ID: %s)\n", userName, userID)
		fmt.Printf("📊 จำนวนรายการ: %d\n", len(userReds))

		for i, r := range userReds {
			fmt.Printf("\n%d. 🎁 รางวัล: %s\n", i+1, r.RewardName)
			fmt.Printf("   📋 ID รายการ: %s\n", r.ID)
			fmt.Printf("   📅 วันที่แลก: %s\n", r.CreatedAt.Format("2006-01-02 15:04:05"))
			if r.ConfirmedAt != nil {
				fmt.Printf("   ✅ วันที่ยืนยัน: %s\n", r.ConfirmedAt.Format("2006-01-02 15:04:05"))
			}
			if r.DeliveryType != nil && *r.DeliveryType != "" {
				fmt.Printf("   🚚 ประเภทจัดส่ง: %s\n", *r.DeliveryType)
			}

			if r.FulfillmentStatus != nil && *r.FulfillmentStatus != "" {
				statusText := getFulfillmentStatusText(*r.FulfillmentStatus)
				fmt.Printf("   📦 สถานะจัดส่ง: %s (%s)\n", *r.FulfillmentStatus, statusText)
			} else {
				fmt.Printf("   📦 สถานะจัดส่ง: ยังไม่มีข้อมูล\n")
			}

			if r.TrackingNumber != nil && *r.TrackingNumber != "" {
				fmt.Printf("   🔍 เลขพัสดุ: %s\n", *r.TrackingNumber)
			}

			if r.CouponCode != nil && *r.CouponCode != "" {
				fmt.Printf("   🎫 โค้ดคูปอง: %s\n", *r.CouponCode)
			}
		}
	}

	// Summary
	fmt.Printf("\n=== สรุป ===\n")
	fmt.Printf("📦 รวมทั้งหมด: %d รายการ\n", len(redemptions))
	fmt.Printf("👥 จำนวนผู้ใช้: %d คน\n", len(userRedemptions))

	// Count by fulfillment status
	statusCount := make(map[string]int)
	for _, r := range redemptions {
		if r.FulfillmentStatus != nil && *r.FulfillmentStatus != "" {
			statusCount[*r.FulfillmentStatus]++
		} else {
			statusCount["ไม่มีสถานะ"]++
		}
	}

	fmt.Printf("\n📊 สถานะการจัดส่ง:\n")
	for status, count := range statusCount {
		statusText := getFulfillmentStatusText(status)
		fmt.Printf("   • %s: %d รายการ\n", statusText, count)
	}
}

func getFulfillmentStatusText(status string) string {
	switch status {
	case "pending":
		return "รับเรื่องแล้ว"
	case "preparing":
		return "กำลังเตรียมจัดส่ง"
	case "shipped":
		return "กำลังจัดส่ง"
	case "delivered":
		return "จัดส่งสำเร็จ"
	case "ไม่มีสถานะ":
		return "ยังไม่มีข้อมูล"
	default:
		return status
	}
}

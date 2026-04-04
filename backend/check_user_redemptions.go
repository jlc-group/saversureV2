package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type RedemptionResponse struct {
	Data []RedemptionEntry `json:"data"`
}

type RedemptionEntry struct {
	ID                string `json:"id"`
	RewardName        string `json:"reward_name"`
	Status            string `json:"status"`
	FulfillmentStatus string `json:"fulfillment_status"`
	TrackingNumber    string `json:"tracking_number"`
	CreatedAt         string `json:"created_at"`
	UserName          string `json:"user_name"`
	UserPhone         string `json:"user_phone"`
}

func main() {
	// Try to get redemption data from backend API
	client := &http.Client{Timeout: 10 * time.Second}

	// Try different endpoints
	endpoints := []string{
		"http://localhost:30400/api/v1/fulfillment",
		"http://localhost:30400/api/v1/redemption/history",
	}

	for _, endpoint := range endpoints {
		fmt.Printf("Trying endpoint: %s\n", endpoint)

		req, err := http.NewRequest("GET", endpoint, nil)
		if err != nil {
			fmt.Printf("Error creating request: %v\n", err)
			continue
		}

		// Add headers
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Tenant-ID", "6337553b-69cc-44ce-a42e-f263ddd47b46")

		resp, err := client.Do(req)
		if err != nil {
			fmt.Printf("Error making request: %v\n", err)
			continue
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			fmt.Printf("Error reading response: %v\n", err)
			continue
		}

		fmt.Printf("Response status: %s\n", resp.Status)
		fmt.Printf("Response body: %s\n", string(body))

		if resp.StatusCode == 200 {
			// Parse JSON
			var redemptionResp RedemptionResponse
			if err := json.Unmarshal(body, &redemptionResp); err != nil {
				fmt.Printf("Error parsing JSON: %v\n", err)
				continue
			}

			// Search for user with name containing "ฉัตรธิดา" or last name "จิตโสภาพันธุ์"
			var userRedemptions []RedemptionEntry
			for _, entry := range redemptionResp.Data {
				if contains(entry.UserName, "ฉัตรธิดา") || contains(entry.UserName, "จิตโสภาพันธุ์") {
					userRedemptions = append(userRedemptions, entry)
				}
			}

			if len(userRedemptions) > 0 {
				fmt.Printf("\n=== พบข้อมูลการแลกแต้มของ ฉัตรธิดา จิตโสภาพันธุ์ ===\n")
				fmt.Printf("จำนวนรายการ: %d\n\n", len(userRedemptions))

				for i, redemption := range userRedemptions {
					fmt.Printf("%d. ID: %s\n", i+1, redemption.ID)
					fmt.Printf("   รางวัล: %s\n", redemption.RewardName)
					fmt.Printf("   สถานะ: %s\n", redemption.Status)
					if redemption.FulfillmentStatus != "" {
						fmt.Printf("   สถานะจัดส่ง: %s\n", redemption.FulfillmentStatus)
					}
					if redemption.TrackingNumber != "" {
						fmt.Printf("   เลขพัสดุ: %s\n", redemption.TrackingNumber)
					}
					fmt.Printf("   วันที่แลก: %s\n", redemption.CreatedAt)
					fmt.Printf("   ชื่อผู้ใช้: %s\n", redemption.UserName)
					fmt.Printf("   เบอร์โทร: %s\n", redemption.UserPhone)
					fmt.Println()
				}
			} else {
				fmt.Printf("\nไม่พบข้อมูลการแลกแต้มของ ฉัตรธิดา จิตโสภาพันธุ์\n")
			}

			return
		}
	}

	fmt.Printf("ไม่สามารถเชื่อมต่อกับ API ได้\n")
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr ||
		func() bool {
			for i := 0; i <= len(s)-len(substr); i++ {
				if s[i:i+len(substr)] == substr {
					return true
				}
			}
			return false
		}())
}

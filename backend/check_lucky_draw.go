package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type LuckyDrawCampaign struct {
	ID                string     `json:"id"`
	Title             string     `json:"title"`
	Description       *string    `json:"description"`
	ImageURL          *string    `json:"image_url"`
	CostPoints        int        `json:"cost_points"`
	MaxTicketsPerUser int        `json:"max_tickets_per_user"`
	TotalTickets      int        `json:"total_tickets"`
	Status            string     `json:"status"`
	RegistrationStart *time.Time `json:"registration_start"`
	RegistrationEnd   *time.Time `json:"registration_end"`
	DrawDate          *time.Time `json:"draw_date"`
	CreatedAt         time.Time  `json:"created_at"`
	PrizeCount        int        `json:"prize_count"`
	TicketCount       int        `json:"ticket_count"`
}

type Prize struct {
	ID          string  `json:"id"`
	CampaignID  string  `json:"campaign_id"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
	ImageURL    *string `json:"image_url"`
	Quantity    int     `json:"quantity"`
	PrizeOrder  int     `json:"prize_order"`
}

func main() {
	ctx := context.Background()

	// Database connection
	dbURL := "postgres://saversure_app:julaherb789@192.168.0.60:5433/saversure?sslmode=disable"
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer pool.Close()

	// Check campaigns
	fmt.Println("=== Lucky Draw Campaigns ===")
	campaignQuery := `
		SELECT 
			id, title, description, image_url, cost_points, max_tickets_per_user, 
			total_tickets, status, registration_start, registration_end, draw_date, 
			created_at
		FROM lucky_draw_campaigns 
		ORDER BY created_at DESC
	`

	rows, err := pool.Query(ctx, campaignQuery)
	if err != nil {
		log.Fatalf("Query campaigns failed: %v", err)
	}
	defer rows.Close()

	var campaigns []LuckyDrawCampaign
	for rows.Next() {
		var c LuckyDrawCampaign
		err := rows.Scan(
			&c.ID, &c.Title, &c.Description, &c.ImageURL, &c.CostPoints, &c.MaxTicketsPerUser,
			&c.TotalTickets, &c.Status, &c.RegistrationStart, &c.RegistrationEnd, &c.DrawDate,
			&c.CreatedAt,
		)
		if err != nil {
			log.Printf("Scan campaign failed: %v", err)
			continue
		}
		campaigns = append(campaigns, c)
	}

	for _, c := range campaigns {
		fmt.Printf("Campaign: %s\n", c.Title)
		fmt.Printf("  ID: %s\n", c.ID)
		fmt.Printf("  Status: %s\n", c.Status)
		fmt.Printf("  Cost Points: %d\n", c.CostPoints)
		fmt.Printf("  Max Tickets Per User: %d\n", c.MaxTicketsPerUser)
		fmt.Printf("  Total Tickets: %d\n", c.TotalTickets)
		fmt.Printf("  Created At: %s\n", c.CreatedAt.Format("2006-01-02 15:04:05"))
		fmt.Println()
	}

	// Check prizes for each campaign
	for _, c := range campaigns {
		fmt.Printf("=== Prizes for: %s ===\n", c.Title)

		prizeQuery := `
			SELECT id, campaign_id, name, description, image_url, quantity, prize_order
			FROM lucky_draw_prizes 
			WHERE campaign_id = $1 
			ORDER BY prize_order
		`

		prizeRows, err := pool.Query(ctx, prizeQuery, c.ID)
		if err != nil {
			log.Printf("Query prizes failed for campaign %s: %v", c.ID, err)
			continue
		}
		defer prizeRows.Close()

		var prizes []Prize
		for prizeRows.Next() {
			var p Prize
			err := prizeRows.Scan(
				&p.ID, &p.CampaignID, &p.Name, &p.Description, &p.ImageURL, &p.Quantity, &p.PrizeOrder,
			)
			if err != nil {
				log.Printf("Scan prize failed: %v", err)
				continue
			}
			prizes = append(prizes, p)
		}

		if len(prizes) == 0 {
			fmt.Printf("  No prizes found!\n")
		} else {
			for _, p := range prizes {
				fmt.Printf("  Prize %d: %s (Qty: %d)\n", p.PrizeOrder, p.Name, p.Quantity)
				if p.Description != nil {
					fmt.Printf("    Description: %s\n", *p.Description)
				}
			}
		}
		fmt.Println()
	}
}

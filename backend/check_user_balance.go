package main

import (
	"context"
	"fmt"
	"log"
	"saversure/internal/ledger"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	db, err := pgxpool.New(context.Background(), "postgres://postgres:postgres@localhost:30402/saversure?sslmode=disable")
	if err != nil {
		log.Fatalf("DB Error: %v", err)
	}
	defer db.Close()

	svc := ledger.NewService(db)
	
	userID := "694050f0-f77a-4847-a4d3-1c6408356ab0"
	tenantID := "6337553b-69cc-44ce-a42e-f263ddd47b46" // Default tenant
	
	// Get user balance
	balance, err := svc.GetBalance(context.Background(), tenantID, userID)
	if err != nil {
		log.Fatalf("Get balance error: %v", err)
	}
	
	fmt.Printf("User ID: %s\n", userID)
	fmt.Printf("Tenant ID: %s\n", tenantID)
	fmt.Printf("Current Balance: %d points\n", balance.Current)
	fmt.Printf("Total Earned: %d points\n", balance.TotalEarned)
	fmt.Printf("Total Spent: %d points\n", balance.TotalSpent)
	fmt.Printf("Total Expired: %d points\n", balance.TotalExpired)
	
	// Also get recent history to see activity
	history, err := svc.GetHistory(context.Background(), tenantID, userID, 10, 0)
	if err != nil {
		log.Printf("Get history error: %v", err)
	} else {
		fmt.Printf("\nRecent History (%d entries):\n", len(history))
		for i, entry := range history {
			fmt.Printf("%d. %s: %d points (Balance after: %d) - %s\n", 
				i+1, entry.EntryType, entry.Amount, entry.BalanceAfter, entry.Description)
		}
	}
}

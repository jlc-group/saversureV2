package main

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	db, err := pgxpool.New(context.Background(), "postgres://postgres:password@localhost:15433/saversure?sslmode=disable")
	if err != nil {
		log.Fatalf("DB Error: %v", err)
	}
	defer db.Close()

	// Search for user by name
	searchName := "ฉัตรธิดา"

	fmt.Printf("Searching for user with name containing: %s\n", searchName)

	// Search in users table
	rows, err := db.Query(context.Background(),
		"SELECT id, display_name, first_name, last_name, email, phone FROM users WHERE display_name ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1",
		"%"+searchName+"%")
	if err != nil {
		log.Fatalf("Search users error: %v", err)
	}
	defer rows.Close()

	var foundUsers []struct {
		ID          string
		DisplayName string
		FirstName   string
		LastName    string
		Email       string
		Phone       string
	}

	for rows.Next() {
		var user struct {
			ID          string
			DisplayName string
			FirstName   string
			LastName    string
			Email       string
			Phone       string
		}

		err := rows.Scan(&user.ID, &user.DisplayName, &user.FirstName, &user.LastName, &user.Email, &user.Phone)
		if err != nil {
			log.Printf("Scan user error: %v", err)
			continue
		}

		foundUsers = append(foundUsers, user)
	}

	if len(foundUsers) == 0 {
		fmt.Printf("No users found with name containing: %s\n", searchName)
		return
	}

	fmt.Printf("Found %d users:\n", len(foundUsers))
	for i, user := range foundUsers {
		fmt.Printf("%d. ID: %s\n", i+1, user.ID)
		fmt.Printf("   Display Name: %s\n", user.DisplayName)
		fmt.Printf("   First Name: %s\n", user.FirstName)
		fmt.Printf("   Last Name: %s\n", user.LastName)
		fmt.Printf("   Email: %s\n", user.Email)
		fmt.Printf("   Phone: %s\n", user.Phone)

		// Check balance for this user
		tenantID := "6337553b-69cc-44ce-a42e-f263ddd47b46"
		var currentBalance int
		err = db.QueryRow(context.Background(),
			"SELECT COALESCE(balance_after, 0) FROM point_ledger WHERE user_id = $1 AND tenant_id = $2 AND currency = 'point' ORDER BY created_at DESC LIMIT 1",
			user.ID, tenantID).Scan(&currentBalance)
		if err != nil {
			if err.Error() == "no rows in result set" {
				fmt.Printf("   Balance: 0 points (no ledger entries)\n")
			} else {
				fmt.Printf("   Balance: Error - %v\n", err)
			}
		} else {
			fmt.Printf("   Balance: %d points\n", currentBalance)
		}

		// Show recent activity
		activityRows, err := db.Query(context.Background(),
			"SELECT entry_type, amount, balance_after, description, created_at FROM point_ledger WHERE user_id = $1 AND tenant_id = $2 ORDER BY created_at DESC LIMIT 3",
			user.ID, tenantID)
		if err == nil {
			fmt.Printf("   Recent Activity:\n")
			for activityRows.Next() {
				var entryType string
				var amount, balanceAfter int
				var description *string
				var createdAt string

				err := activityRows.Scan(&entryType, &amount, &balanceAfter, &description, &createdAt)
				if err != nil {
					continue
				}

				desc := "N/A"
				if description != nil {
					desc = *description
				}

				fmt.Printf("     - %s: %+d points (balance: %d) - %s\n",
					entryType, amount, balanceAfter, desc)
			}
			activityRows.Close()
		}

		fmt.Println()
	}
}

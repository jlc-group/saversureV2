package main

import (
	"fmt"
	"io"
	"net/http"
	"time"
)

func main() {
	// Get user info for the current logged in user
	client := &http.Client{Timeout: 10 * time.Second}
	
	userID := "6337553b-69cc-44ce-a42e-f263ddd47b46"
	tenantID := "00000000-0000-0000-0000-000000000001"
	
	// Try to get user profile
	req, err := http.NewRequest("GET", "http://localhost:30400/api/v1/profile", nil)
	if err != nil {
		fmt.Printf("Error creating request: %v\n", err)
		return
	}
	
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Tenant-ID", tenantID)
	req.Header.Set("X-User-ID", userID)
	
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error making request: %v\n", err)
		return
	}
	defer resp.Body.Close()
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response: %v\n", err)
		return
	}
	
	fmt.Printf("User Profile Response:\n")
	fmt.Printf("Status: %s\n", resp.Status)
	fmt.Printf("Body: %s\n", string(body))
	
	// Now try to get redeem transactions
	req2, err := http.NewRequest("GET", "http://localhost:30400/api/v1/my/redeem-transactions", nil)
	if err != nil {
		fmt.Printf("Error creating request: %v\n", err)
		return
	}
	
	req2.Header.Set("Content-Type", "application/json")
	req2.Header.Set("X-Tenant-ID", tenantID)
	req2.Header.Set("X-User-ID", userID)
	
	resp2, err := client.Do(req2)
	if err != nil {
		fmt.Printf("Error making request: %v\n", err)
		return
	}
	defer resp2.Body.Close()
	
	body2, err := io.ReadAll(resp2.Body)
	if err != nil {
		fmt.Printf("Error reading response: %v\n", err)
		return
	}
	
	fmt.Printf("\n\nRedeem Transactions Response:\n")
	fmt.Printf("Status: %s\n", resp2.Status)
	fmt.Printf("Body: %s\n", string(body2))
}

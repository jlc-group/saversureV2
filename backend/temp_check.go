package main

import (
    "context"
    "fmt"
    "log"
    "github.com/jackc/pgx/v5"
)

func main() {
    connString := "postgres://saversure_app:julaherb789@localhost:15433/saversure"
    conn, err := pgx.Connect(context.Background(), connString)
    if err != nil {
        log.Fatalf("Unable to connect to database: %v\n", err)
    }
    defer conn.Close(context.Background())

    rows, err := conn.Query(context.Background(), "SELECT id, name, tenant_id FROM factories")
    if err != nil {
        log.Fatalf("Query failed: %v\n", err)
    }
    defer rows.Close()

    count := 0
    for rows.Next() {
        var id, name, tenantID string
        err := rows.Scan(&id, &name, &tenantID)
        if err != nil {
            log.Fatal(err)
        }
        fmt.Printf("Row: ID=%s, Name=%s, TenantID=%s\n", id, name, tenantID)
        count++
    }
    if rows.Err() != nil {
        log.Fatal(rows.Err())
    }
    fmt.Printf("Total factories found: %d\n", count)
}

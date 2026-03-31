import { Client } from "pg";

async function main() {
    console.log("--- Checking Database (Port 15433) ---");
    const client = new Client({
        connectionString: "postgres://saversure_app:julaherb789@localhost:15433/saversure?sslmode=disable",
    });

    try {
        await client.connect();
        console.log("DB Connected successfully.");
        const res = await client.query("SELECT id, name, tenant_id FROM factories");
        console.log(`DB factories row count: ${res.rows.length}`);
        console.dir(res.rows);
    } catch (e) {
        console.error("DB Error:", e.message);
    } finally {
        await client.end();
    }
}

main();

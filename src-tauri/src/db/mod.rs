use std::fs;
use std::path::PathBuf;

use rusqlite::{params, Connection, Result};
use sha2::{Digest, Sha256};
use tauri::Manager;

pub mod migrations;

pub fn hash_password(value: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(value.as_bytes());
    let hash = hasher.finalize();
    format!("{hash:x}")
}

fn seed_defaults(conn: &Connection) -> Result<()> {
    conn.execute(
        "INSERT OR IGNORE INTO roles (name) VALUES (?1)",
        params!["admin"],
    )?;
    conn.execute(
        "INSERT OR IGNORE INTO roles (name) VALUES (?1)",
        params!["user"],
    )?;

    let admin_exists: i64 = conn.query_row(
        "SELECT COUNT(1) FROM users WHERE username = ?1",
        params!["admin"],
        |row| row.get(0),
    )?;

    if admin_exists == 0 {
        let admin_role_id: i64 = conn.query_row(
            "SELECT id FROM roles WHERE name = ?1 LIMIT 1",
            params!["admin"],
            |row| row.get(0),
        )?;

        let admin_hash = hash_password("admin123");
        conn.execute(
            "
            INSERT INTO users (full_name, username, password_hash, role_id, is_active)
            VALUES (?1, ?2, ?3, ?4, 1)
            ",
            params!["System Admin", "admin", admin_hash, admin_role_id],
        )?;
    }

    let product_exists: i64 = conn.query_row(
        "SELECT COUNT(1) FROM products",
        params![],
        |row| row.get(0),
    )?;

    if product_exists == 0 {
        let season_id: Option<i64> = conn
            .query_row(
                "SELECT id FROM seasons ORDER BY id ASC LIMIT 1",
                params![],
                |row| row.get(0),
            )
            .ok();

        let season_id = if season_id.is_some() {
            season_id
        } else {
            conn.execute(
                "INSERT INTO seasons (name, is_active) VALUES (?1, 1)",
                params!["Default Season"],
            )?;
            Some(conn.last_insert_rowid())
        };

        conn.execute(
            "
            INSERT INTO products (sku, name, description, season_id, is_active)
            VALUES (?1, ?2, ?3, ?4, 1)
            ",
            params![
                "DEMO-001",
                "Demo Product",
                "Seeded demo product for inventory adjustments",
                season_id
            ],
        )?;
    }

    conn.execute(
        "INSERT OR IGNORE INTO inventory_stocks (product_id, quantity) SELECT id, 0 FROM products",
        params![],
    )?;

    Ok(())
}

pub fn database_path(app: &tauri::AppHandle) -> Result<PathBuf> {
    let mut path = app
        .path()
        .app_data_dir()
        .expect("failed to resolve app data directory");

    path.push("framstack-poc.db");
    Ok(path)
}

pub fn open_database(app: &tauri::AppHandle) -> Result<Connection> {
    let path = database_path(app)?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).expect("failed to create app data directory");
    }

    let mut connection = Connection::open(path)?;

    connection.execute_batch(
        "
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        ",
    )?;

    migrations::run_migrations(&mut connection)?;
    seed_defaults(&connection)?;

    Ok(connection)
}
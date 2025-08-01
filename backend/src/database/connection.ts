import mysql from 'mysql2/promise';
import { config } from '../config/config';

// Create connection pool
export const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

// Initialize database connection and create tables if they don't exist
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    console.log(`📊 Connected to: ${config.database.host}:${config.database.port}/${config.database.name}`);
    
    // Run initial setup/migrations
    await runMigrations(connection);
    
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Basic migration runner
const runMigrations = async (connection: mysql.PoolConnection): Promise<void> => {
  try {
    // Create clients table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        meta_account_name VARCHAR(255),
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create performance_records table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS performance_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        account_name VARCHAR(255),
        ad_name TEXT,
        day DATE,
        spend DECIMAL(10,2),
        impressions INT,
        link_clicks INT,
        purchases INT,
        purchase_value DECIMAL(10,2),
        frequency DECIMAL(4,2),
        cpm DECIMAL(10,2),
        cpc DECIMAL(10,2),
        ctr DECIMAL(5,4),
        reach INT,
        video_views INT,
        video_view_rate DECIMAL(5,4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        INDEX idx_client_date (client_id, day)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create analysis_results table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS analysis_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        creative_hash VARCHAR(255),
        creative_description TEXT,
        effectiveness_score INT,
        effectiveness_justification TEXT,
        clarity_score INT,
        clarity_justification TEXT,
        text_to_image_ratio INT,
        text_to_image_ratio_justification TEXT,
        funnel_stage VARCHAR(20),
        funnel_stage_justification TEXT,
        recommendations JSON,
        advantage_plus_analysis JSON,
        placement_summaries JSON,
        overall_conclusion JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        INDEX idx_client (client_id),
        INDEX idx_hash (creative_hash)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create import_batches table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS import_batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        file_name VARCHAR(255),
        file_type VARCHAR(50),
        records_imported INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        INDEX idx_client_status (client_id, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create meta_api_configs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS meta_api_configs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        app_id VARCHAR(255) NOT NULL,
        app_secret VARCHAR(255) NOT NULL,
        access_token TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create uploaded_videos table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS uploaded_videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        file_name VARCHAR(255),
        original_name VARCHAR(255),
        file_path VARCHAR(500),
        file_size BIGINT,
        mime_type VARCHAR(100),
        duration DECIMAL(10,2),
        width INT,
        height INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        INDEX idx_client (client_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create processed_hashes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS processed_hashes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hash VARCHAR(255) UNIQUE NOT NULL,
        client_id INT NOT NULL,
        file_name VARCHAR(255),
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        INDEX idx_hash (hash),
        INDEX idx_client (client_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create bitacora_reports table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bitacora_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        date DATE,
        campaign_name VARCHAR(255),
        ad_set_name VARCHAR(255),
        spend DECIMAL(10,2),
        impressions INT,
        clicks INT,
        conversions INT,
        conversion_value DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        INDEX idx_client_date (client_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create application_logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS application_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        level VARCHAR(20),
        message TEXT,
        meta JSON,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_level (level),
        INDEX idx_timestamp (timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Query helper functions
export const query = async (sql: string, params?: any[]): Promise<any> => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

export const queryRow = async (sql: string, params?: any[]): Promise<any> => {
  const [rows] = await pool.execute(sql, params);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
};

export const transaction = async (callback: (connection: mysql.PoolConnection) => Promise<any>): Promise<any> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Graceful shutdown
export const closeDatabase = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
};

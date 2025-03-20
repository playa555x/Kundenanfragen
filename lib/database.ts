export async function executeQuery(query: string, params: any[] = []) {
  try {
    const apiUrl = process.env.NILE_API_URL
    const apiKey = process.env.NILE_API_KEY

    if (!apiUrl || !apiKey) {
      throw new Error("NILE_API_URL or NILE_API_KEY environment variables are not set")
    }

    const response = await fetch(`${apiUrl}/api/v1/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        params,
      }),
    })

    if (!response.ok) {
      throw new Error(`Nile API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error executing database query:", error)
    throw error
  }
}

// Type definitions
export type Customer = {
  id: number
  name: string
  email: string | null
  password: string
  first_login: boolean
  created_at: Date
  updated_at?: Date
  theme_color?: string
  is_admin?: boolean
  company?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
}

export type Message = {
  id: number
  customer_id: number
  name: string
  email: string
  message: string
  read: boolean
  created_at: Date
  updated_at?: Date
}

export type DiagramSettings = {
  id: number
  customer_id: number
  pv_analyse: boolean
  ppa_cost_analysis: boolean
  lastgang_dashboard: boolean
  energy_heatmap: boolean
  created_at?: Date
  updated_at?: Date
}

export type Document = {
  id: number
  name: string
  file_path: string
  file_type: string
  file_size: number
  category?: string
  customer_id?: number
  is_public: boolean
  download_count: number
  created_at?: Date
  updated_at?: Date
}

export type Project = {
  id: number
  name: string
  description?: string
  customer_id: number
  status: string
  start_date?: Date
  end_date?: Date
  created_at?: Date
  updated_at?: Date
}

// Customer functions
export async function getCustomers() {
  const result = await executeQuery("SELECT * FROM customers ORDER BY name")
  return result.rows
}

export async function getCustomerById(id: number) {
  const result = await executeQuery("SELECT * FROM customers WHERE id = $1", [id])
  return result.rows.length > 0 ? result.rows[0] : null
}

export async function getCustomerByPassword(password: string) {
  try {
    const result = await executeQuery("SELECT * FROM customers WHERE password = $1", [password])
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error("Error in getCustomerByPassword:", error)
    throw new Error(`Database error: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function createCustomer(name: string, email: string | null, password: string) {
  const result = await executeQuery(
    "INSERT INTO customers (name, email, password, first_login) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, email, password, true],
  )
  return result.rows[0]
}

export async function updateCustomer(id: number, data: Partial<Customer>) {
  const fields = Object.keys(data)
    .map((key, i) => `${key} = $${i + 2}`)
    .join(", ")
  const values = Object.values(data)

  const query = `UPDATE customers SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`
  const result = await executeQuery(query, [id, ...values])

  return result.rows.length > 0 ? result.rows[0] : null
}

export async function deleteCustomer(id: number) {
  const result = await executeQuery("DELETE FROM customers WHERE id = $1", [id])
  return result.rowCount > 0
}

// Message functions
export async function getMessages(customerId?: number) {
  if (customerId) {
    const result = await executeQuery("SELECT * FROM messages WHERE customer_id = $1 ORDER BY created_at DESC", [
      customerId,
    ])
    return result.rows
  } else {
    const result = await executeQuery("SELECT * FROM messages ORDER BY created_at DESC")
    return result.rows
  }
}

export async function createMessage(customerId: number, name: string, email: string, message: string) {
  const result = await executeQuery(
    "INSERT INTO messages (customer_id, name, email, message, read) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [customerId, name, email, message, false],
  )
  return result.rows[0]
}

export async function markMessageAsRead(id: number) {
  const result = await executeQuery(
    "UPDATE messages SET read = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
    [id],
  )
  return result.rows.length > 0 ? result.rows[0] : null
}

// Diagram settings
export async function getDiagramSettings(customerId: number) {
  const result = await executeQuery("SELECT * FROM diagram_settings WHERE customer_id = $1", [customerId])
  return result.rows.length > 0 ? result.rows[0] : null
}

export async function updateDiagramSettings(customerId: number, settings: Partial<DiagramSettings>) {
  // Check if settings exist
  const existing = await getDiagramSettings(customerId)

  if (existing) {
    // Update
    const fields = Object.keys(settings)
      .map((key, i) => `${key} = $${i + 2}`)
      .join(", ")
    const values = Object.values(settings)

    const query = `UPDATE diagram_settings SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE customer_id = $1 RETURNING *`
    const result = await executeQuery(query, [customerId, ...values])

    return result.rows.length > 0 ? result.rows[0] : null
  } else {
    // Insert
    const keys = Object.keys(settings).join(", ")
    const placeholders = Object.keys(settings)
      .map((_, i) => `$${i + 2}`)
      .join(", ")
    const values = Object.values(settings)

    const query = `INSERT INTO diagram_settings (customer_id, ${keys}) VALUES ($1, ${placeholders}) RETURNING *`
    const result = await executeQuery(query, [customerId, ...values])

    return result.rows[0]
  }
}

export async function changePassword(id: number, newPassword: string) {
  const result = await executeQuery(
    "UPDATE customers SET password = $2, first_login = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
    [id, newPassword],
  )
  return result.rows.length > 0 ? result.rows[0] : null
}

// Document functions
export async function getDocuments(customerId?: number) {
  if (customerId) {
    const result = await executeQuery(
      "SELECT * FROM documents WHERE customer_id = $1 OR is_public = true ORDER BY created_at DESC",
      [customerId],
    )
    return result.rows
  } else {
    const result = await executeQuery("SELECT * FROM documents ORDER BY created_at DESC")
    return result.rows
  }
}

export async function createDocument(
  name: string,
  filePath: string,
  fileType: string,
  fileSize: number,
  category?: string,
  customerId?: number,
  isPublic = false,
) {
  const result = await executeQuery(
    `INSERT INTO documents 
     (name, file_path, file_type, file_size, category, customer_id, is_public) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *`,
    [name, filePath, fileType, fileSize, category, customerId, isPublic],
  )
  return result.rows[0]
}

export async function incrementDocumentDownload(id: number) {
  const result = await executeQuery(
    "UPDATE documents SET download_count = download_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
    [id],
  )
  return result.rows.length > 0 ? result.rows[0] : null
}

// Project functions
export async function getProjects(customerId?: number) {
  if (customerId) {
    const result = await executeQuery("SELECT * FROM projects WHERE customer_id = $1 ORDER BY created_at DESC", [
      customerId,
    ])
    return result.rows
  } else {
    const result = await executeQuery("SELECT * FROM projects ORDER BY created_at DESC")
    return result.rows
  }
}

export async function createProject(name: string, customerId: number, description?: string) {
  const result = await executeQuery(
    "INSERT INTO projects (name, customer_id, description) VALUES ($1, $2, $3) RETURNING *",
    [name, customerId, description],
  )
  return result.rows[0]
}

export async function updateProject(id: number, data: Partial<Project>) {
  const fields = Object.keys(data)
    .map((key, i) => `${key} = $${i + 2}`)
    .join(", ")
  const values = Object.values(data)

  const query = `UPDATE projects SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`
  const result = await executeQuery(query, [id, ...values])

  return result.rows.length > 0 ? result.rows[0] : null
}

// Database initialization
export async function initializeDatabase() {
  // Customers table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      password VARCHAR(255) NOT NULL,
      first_login BOOLEAN DEFAULT true,
      theme_color VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      is_admin BOOLEAN DEFAULT false,
      company VARCHAR(255),
      logo_url TEXT,
      primary_color VARCHAR(50) DEFAULT '#ffde00',
      secondary_color VARCHAR(50) DEFAULT '#ff0000',
      CONSTRAINT unique_customer_email UNIQUE (email)
    )
  `)

  // Messages table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Diagram settings table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS diagram_settings (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
      pv_analyse BOOLEAN DEFAULT true,
      ppa_cost_analysis BOOLEAN DEFAULT true,
      lastgang_dashboard BOOLEAN DEFAULT true,
      energy_heatmap BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_customer_settings UNIQUE (customer_id)
    )
  `)

  // Documents table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      file_path TEXT NOT NULL,
      file_type VARCHAR(50) NOT NULL,
      file_size INTEGER NOT NULL,
      category VARCHAR(100),
      customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
      is_public BOOLEAN DEFAULT false,
      download_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Projects table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'active',
      start_date DATE,
      end_date DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Project data table
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS project_data (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      data_type VARCHAR(100) NOT NULL,
      data_value JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Indexes for better performance
  await executeQuery("CREATE INDEX IF NOT EXISTS idx_messages_customer_id ON messages(customer_id)")
  await executeQuery("CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read)")
  await executeQuery("CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON documents(customer_id)")
  await executeQuery("CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category)")
  await executeQuery("CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id)")
  await executeQuery("CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)")
  await executeQuery("CREATE INDEX IF NOT EXISTS idx_project_data_project_id ON project_data(project_id)")
  await executeQuery("CREATE INDEX IF NOT EXISTS idx_project_data_data_type ON project_data(data_type)")

  // Create admin user if it doesn't exist
  const adminPassword = "050712"
  const existingAdmin = await getCustomerByPassword(adminPassword)

  if (!existingAdmin) {
    await createCustomer("Administrator", "admin@example.com", adminPassword)
  }

  return { success: true, message: "Database initialized successfully" }
}

// Dummy pool for compatibility with code that directly imports pool
export const pool = {
  query: async (text: string, params: any[] = []) => {
    return executeQuery(text, params)
  },
}


import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export interface ExportOptions {
  filename?: string
  sheetName?: string
}

export function exportToExcel(
  data: any[],
  columns: { key: string; label: string }[],
  options: ExportOptions = {}
) {
  const { filename = 'export', sheetName = 'Sheet1' } = options

  // Prepare data for Excel
  const excelData = data.map((item) => {
    const row: any = {}
    columns.forEach((col) => {
      row[col.label] = item[col.key] || ''
    })
    return row
  })

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  })

  // Save file
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `${filename}.xlsx`)
}

export function exportMastersToExcel(masters: any[]) {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Ism' },
    { key: 'phone', label: 'Telefon' },
    { key: 'specialization', label: 'Mutaxassislik' },
    { key: 'region', label: 'Viloyat' },
    { key: 'district', label: 'Tuman' },
    { key: 'address', label: 'Manzil' },
    { key: 'telegram_username', label: 'Telegram' },
    { key: 'experience_years', label: 'Tajriba (yil)' },
    { key: 'status', label: 'Status' },
    { key: 'last_conversation_date', label: 'Oxirgi Gaplashuv' },
  ]

  const formattedMasters = masters.map((master) => ({
    ...master,
    status: master.status === 'active' ? 'Faol' : 'Nofaol',
    last_conversation_date: master.last_conversation_date
      ? new Date(master.last_conversation_date).toLocaleString('uz-UZ')
      : '',
  }))

  exportToExcel(formattedMasters, columns, {
    filename: `ustalar_${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Ustalar',
  })
}

export function exportClientsToExcel(clients: any[]) {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Ism' },
    { key: 'phone', label: 'Telefon' },
    { key: 'house_type', label: 'Uy Turi' },
    { key: 'payment_method', label: 'To\'lov Usuli' },
    { key: 'status', label: 'Status' },
    { key: 'last_conversation_date', label: 'Oxirgi Gaplashuv' },
  ]

  const formattedClients = clients.map((client) => ({
    ...client,
    status: client.status === 'active' ? 'Faol' : 'Nofaol',
    last_conversation_date: client.last_conversation_date
      ? new Date(client.last_conversation_date).toLocaleString('uz-UZ')
      : '',
  }))

  exportToExcel(formattedClients, columns, {
    filename: `mijozlar_${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Mijozlar',
  })
}



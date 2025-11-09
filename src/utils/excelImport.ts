import * as XLSX from 'xlsx'

export function importFromExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Faylni o\'qishda xatolik'))
    reader.readAsArrayBuffer(file)
  })
}

export function mapExcelToMasters(excelData: any[]): any[] {
  return excelData.map((row: any) => ({
    name: row['Ism'] || row['Name'] || row['ism'] || '',
    phone: row['Telefon'] || row['Phone'] || row['telefon'] || '',
    specialization: row['Mutaxassislik'] || row['Specialization'] || row['specialization'] || '',
    region: row['Viloyat'] || row['Region'] || row['region'] || '',
    district: row['Tuman'] || row['District'] || row['district'] || '',
    address: row['Manzil'] || row['Address'] || row['address'] || '',
    telegram_username: row['Telegram'] || row['Telegram Username'] || row['telegram_username'] || '',
    experience_years: row['Tajriba'] || row['Experience'] || row['experience_years'] || null,
    status: row['Status'] || row['status'] || 'active',
  })).filter(master => master.name) // Faqat ism bo'lganlarini qoldirish
}

export function mapExcelToClients(excelData: any[]): any[] {
  return excelData.map((row: any) => ({
    name: row['Ism'] || row['Name'] || row['ism'] || '',
    phone: row['Telefon'] || row['Phone'] || row['telefon'] || '',
    house_type: row['Uy Turi'] || row['House Type'] || row['house_type'] || '',
    payment_method: row['To\'lov Usuli'] || row['Payment Method'] || row['payment_method'] || '',
    status: row['Status'] || row['status'] || 'active',
  })).filter(client => client.name) // Faqat ism bo'lganlarini qoldirish
}



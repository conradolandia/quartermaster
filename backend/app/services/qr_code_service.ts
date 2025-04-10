import qrcode from 'qrcode'

export default class QrCodeService {
  /**
   * Generates a QR code as a data URL for the given text.
   * @param text The text to encode (typically a URL).
   * @returns A promise that resolves with the QR code data URL (e.g., 'data:image/png;base64,...').
   */
  async generateQrCodeDataUrl(text: string): Promise<string> {
    try {
      const dataUrl = await qrcode.toDataURL(text)
      return dataUrl
    } catch (error) {
      // Log the error or handle it appropriately
      console.error('Error generating QR code:', error)
      // Re-throw the error to be handled by the caller
      throw error
    }
  }
} 
import { test } from '@japa/runner'
import QrCodeService from '#services/qr_code_service'
import sinon from 'sinon'
import qrcode from 'qrcode'

test.group('QrCodeService', (group) => {
  // Restore stubs after each test
  group.each.teardown(() => {
    sinon.restore()
  })

  test('generateQrCodeDataUrl generates a data URL', async ({ assert }) => {
    // Arrange
    const qrCodeService = new QrCodeService()
    const testUrl = 'https://example.com/check-in?booking=TEST123'
    const expectedDataUrl = 'data:image/png;base64,fakedata'

    // Stub the qrcode.toDataURL method
    const toDataURLStub = sinon.stub(qrcode, 'toDataURL').resolves(expectedDataUrl)

    // Act
    const dataUrl = await qrCodeService.generateQrCodeDataUrl(testUrl)

    // Assert
    assert.isTrue(toDataURLStub.calledOnceWith(testUrl))
    assert.strictEqual(dataUrl, expectedDataUrl)
    assert.match(dataUrl, /^data:image\/png;base64,/)
  })

  test('generateQrCodeDataUrl handles errors from qrcode library', async ({ assert }) => {
    // Arrange
    const qrCodeService = new QrCodeService()
    const testUrl = 'https://example.com/check-in?booking=FAIL'
    const expectedError = new Error('QR Generation Failed')

    // Stub the qrcode.toDataURL method to throw an error
    const toDataURLStub = sinon.stub(qrcode, 'toDataURL').rejects(expectedError)

    // Act & Assert
    await assert.rejects(async () => {
      await qrCodeService.generateQrCodeDataUrl(testUrl)
    }, expectedError.message)

    assert.isTrue(toDataURLStub.calledOnceWith(testUrl))
  })
}) 
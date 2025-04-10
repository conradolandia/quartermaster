import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    // Handle VineJS validation errors
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return ctx.response.status(422).json({
        error: 'Validation failed',
        messages: error.messages,
      })
    }

    // Handle 404 errors
    if (this.isNotFoundException(error)) {
      return ctx.response.status(404).json({
        error: 'Resource not found',
      })
    }

    // Let parent handle the rest
    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note Do not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    if (!app.inProduction) {
      console.error(error)
    }
    return super.report(error, ctx)
  }

  /**
   * Check if error is a 404 error
   */
  protected isNotFoundException(error: any): boolean {
    return (
      (error.code === 'E_ROW_NOT_FOUND') ||
      (error.status === 404) ||
      (error.message && error.message.includes('not found'))
    )
  }
}

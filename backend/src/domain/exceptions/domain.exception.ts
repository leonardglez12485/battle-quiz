/**
 * Se lanza cuando se viola una invariante de dominio (p. ej. publicar una
 * pregunta sin respuesta correcta). La capa de presentación la traduce a un
 * 400; nunca debe llegar cruda al cliente como 500.
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

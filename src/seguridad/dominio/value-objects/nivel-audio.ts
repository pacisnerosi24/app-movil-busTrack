// Protegemos el sistema para que no ingresen valores acústicos imposibles
export class NivelAudio {
  constructor(public readonly decibeles: number) {
    if (decibeles < 0 || decibeles > 200) {
      throw new Error('El nivel de decibeles es inválida o irreal.');
    }
  }

  esRuidoPeligroso(): boolean {
    // Definimos el umbral de un grito fuerte o disparo (ej. > 90 dB)
    return this.decibeles > 90;
  }
}
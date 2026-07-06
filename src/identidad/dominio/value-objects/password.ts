import * as bcrypt from 'bcryptjs';

export class Password {
  private constructor(public readonly valorHash: string) {}

  // Método de fábrica para crear una contraseña desde texto plano y validarla
  static async crear(textoPlano: string): Promise<Password> {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!regex.test(textoPlano)) {
      throw new Error('La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial.');
    }

    // Si pasa la validación, la encriptamos inmediatamente (Costo 10 es el estándar seguro y rápido)
    const hash = await bcrypt.hash(textoPlano, 10);
    return new Password(hash);
  }

  // Método para cuando recuperamos el usuario de la BD (ya viene hasheada)
  static desdeHash(hashExistente: string): Password {
    return new Password(hashExistente);
  }
}
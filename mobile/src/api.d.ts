export type Usuario = {
    id: string;
    email: string;
    rol: string;
};
export type LoginResp = {
    token: string;
    usuario: Usuario;
};
export declare function login(email: string, password: string): Promise<LoginResp>;
export declare function enviarUbicacion(token: string, idBus: string, latitud: number, longitud: number): Promise<void>;
export type AlertaResp = {
    mensaje: string;
    alertaId: string;
    esCritica: boolean;
};
export declare function dispararAlerta(token: string, idBus: string): Promise<AlertaResp>;

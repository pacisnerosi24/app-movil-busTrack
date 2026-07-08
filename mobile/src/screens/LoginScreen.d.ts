import { Usuario } from '../api';
type Props = {
    onLogin: (token: string, usuario: Usuario) => void;
};
export default function LoginScreen({ onLogin }: Props): any;
export {};

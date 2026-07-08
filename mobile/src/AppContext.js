"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppProvider = AppProvider;
exports.useApp = useApp;
const react_1 = require("react");
const Ctx = (0, react_1.createContext)(null);
function AppProvider({ token, usuario, onLogout, children, }) {
    const [rutaSeleccionada, setRutaSeleccionada] = (0, react_1.useState)(null);
    return (<Ctx.Provider value={{ token, usuario, rutaSeleccionada, setRutaSeleccionada, logout: onLogout }}>
      {children}
    </Ctx.Provider>);
}
function useApp() {
    const v = (0, react_1.useContext)(Ctx);
    if (!v)
        throw new Error('useApp debe usarse dentro de <AppProvider>');
    return v;
}
//# sourceMappingURL=AppContext.js.map
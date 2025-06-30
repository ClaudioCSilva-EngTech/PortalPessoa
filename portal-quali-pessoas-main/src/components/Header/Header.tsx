import React from "react";
import { FaEarlybirds, FaUserPlus, FaSignInAlt, FaRegBell } from "react-icons/fa";
import "./Header.scss";

interface MenuItem {
  label: string;
  key: string;
}

interface HeaderProps {
  showTooltip?: boolean;
  setShowTooltip: (show: boolean) => void;
  notificationCount: number;
  onOpenChat?: () => void;
  onMenuClick?: (key: string) => void;
  activeMenu?: string;
  menus?: MenuItem[];
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  menus = [],
  showTooltip,
  setShowTooltip,
  notificationCount,
  onOpenChat,
  onMenuClick,
  activeMenu,
  onHomeClick
}) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">
          <FaEarlybirds size={28} color="#0a2885" style={{ marginRight: 6, verticalAlign: "middle" }} />
          <a href="/" className="home-link" onClick={e => { e.preventDefault(); onHomeClick(); }}>
            Portal Pessoas
          </a>
        </h1>
      </div>

      <div className="header-center">
        <nav className="header-menu">
          {menus.map((item) => (
            <button
              key={item.key}
              className={`header-menu-btn${activeMenu === item.key ? " active" : ""}`}
              onClick={() => onMenuClick?.(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="header-right">
        {/* <FaSearch className="header-icon" /> */}
        <div className="recruitment-avatar">
          <FaUserPlus />
        </div>
        <div
          className="header-icon"
          onClick={() => setShowTooltip(!showTooltip)}
          style={{ cursor: "pointer" }}
        >
          <FaSignInAlt />
        </div>
        {showTooltip && (
          <div className="signin-tooltip">
            <form>
              <div className="signin-field">
                <label htmlFor="username">Nome de usuário</label>
                <input type="text" id="username" placeholder="Digite seu nome" />
              </div>
              <div className="signin-field">
                <label htmlFor="password">Senha</label>
                <input type="password" id="password" placeholder="Digite sua senha" />
              </div>
              <div className="signin-actions">
                <button type="submit" className="signin-button">
                  Entrar
                </button>
                <a href="#" className="signin-recover">
                  Recuperar senha
                </a>
              </div>
            </form>
          </div>
        )}
        <div className="header-notification" onClick={onOpenChat} style={{ cursor: "pointer", position: "relative" }}>
          <FaRegBell size={24} />
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
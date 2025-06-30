import React from "react";
import {
  FaChevronLeft,
  FaBars,
  FaHome,
  FaUsers,
  FaSuitcase,
  FaUmbrellaBeach,
  FaPlaneDeparture,
  FaFileInvoiceDollar,
  FaHandHoldingHeart,
  FaTshirt,
  FaComments,
  FaSlideshare,
} from "react-icons/fa";
import "./Sidebar.scss";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  onNavigate: (componentName: string, subComponentName?: string) => void;
  current: string;
}

const sidebarIcons = [
  { icon: <FaPlaneDeparture size={32} />, key: "VacationManagement", label: "Férias" },
  { icon: <FaFileInvoiceDollar size={32} />, key: "Finance", label: "Reembolsos" },
  { icon: <FaHandHoldingHeart size={32} />, key: "Benefits", label: "Benefícios" },
  { icon: <FaTshirt size={32} />, key: "Uniform", label: "Uniformes" },
  { icon: <FaSlideshare size={32} />, key: "Training", label: "Treinamentos" },
  { icon: <FaComments size={32} />, key: "FaqPeople", label: "RH Responde" },
  { icon: <FaUsers size={32} />, key: "PeopleDepartmentManagement", label: "Pessoas" },
  { icon: <FaHome size={32} />, key: "ShowCase", label: "Início" },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle, onNavigate, current }) => {
  const handleSidebarIconClick = (key: string) => {
    onNavigate(key);
  };

  return (
    <aside className={`job-search-sidebar${open ? " open" : " closed"}`}>
      <button
        className="job-search-sidebar-toggle"
        onClick={onToggle}
        aria-label={open ? "Fechar menu lateral" : "Abrir menu lateral"}
      >
        {open ? <FaChevronLeft size={24} /> : <FaBars size={24} />}
      </button>
      <div className="job-search-sidebar-scroll">
        {open && (
          <>
            <div className="sidebar-section">
              <h2 className="sidebar-title">Pesquisa</h2>
              <div className="filter-group">
                <label htmlFor="company">Empresa</label>
                <select id="company" className="filter-select">
                  <option>Selecione ou digite</option>
                  <option>QualiConsig</option>
                  <option>QualiBanking</option>
                  <option>GrupoQuali</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="jobType">Tipo de Vaga</label>
                <select id="jobType" className="filter-select">
                  <option>Selecione</option>
                  <option>Temporária</option>
                  <option>Estágio</option>
                  <option>Efetivo</option>
                </select>
              </div>
              <div className="filter-group">
                <label>
                  <input type="checkbox" /> Vagas Afirmativas
                </label>
              </div>
            </div>
            <hr className="sidebar-divider" />
            <div className="sidebar-section">
              <h2 className="sidebar-title">Funcionalidades</h2>
              <ul className="sidebar-list">
                {sidebarIcons.map(({ icon, label, key }) => (
                  <li
                    key={key}
                    className={`sidebar-list-item${current === key ? " active" : ""}`}
                    onClick={() => handleSidebarIconClick(key)}
                  >
                    <span className="sidebar-icon">{icon}</span>
                    <span className="sidebar-label">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
        {!open && (
          <div className="job-search-sidebar-icons">
            {sidebarIcons.map(({ icon, key }) => (
              <div
                key={key}
                className={`sidebar-icon-only${current === key ? " active" : ""}`}
                title={key}
                onClick={() => handleSidebarIconClick(key)}
              >
                {icon}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
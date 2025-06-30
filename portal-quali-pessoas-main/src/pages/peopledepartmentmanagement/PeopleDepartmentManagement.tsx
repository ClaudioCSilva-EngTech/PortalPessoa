import React, { useState, useEffect } from "react";
import FormRequestApData from "./FormRequestApData";
import ApprovalRequest from "./ApprovalRequest";
import ConsultRequest from "./ConsultRequest";
import IntegrationApData from "./IntegrationApData";
import DisciplinaryMeasure from "./DisciplinaryMeasure";
import EmployeeTermination from "./EmployeeTermination";
import Header from "../../components/Header/Header";
import "../../styles/PeopleDepartmentManagement.css";

interface Props {
  initialComponent?: string;
  onComponentChange: (componentName: string, subComponentName?: string) => void;
}

const peopleMenus: [] = [];

const componentMap: Record<string, React.ReactNode> = {
  ApprovalRequest: <ApprovalRequest />,
  FormRequestApData: <FormRequestApData />,
  ConsultRequest: <ConsultRequest />,
  IntegrationApData: <IntegrationApData />,
  DisciplinaryMeasure: <DisciplinaryMeasure />,
  EmployeeTermination: <EmployeeTermination />,
};

const PeopleDepartmentManagement: React.FC<Props> = ({ initialComponent, onComponentChange }) => {
  const [activeComponent, setActiveComponent] = useState<string>(initialComponent || "ApprovalRequest");

  const [showTooltip, setShowTooltip] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const onOpenChat = () => {};
  const onMenuClick = (key: string) => setActiveComponent(key);
  const activeMenu = activeComponent;

  useEffect(() => {
    if (initialComponent) setActiveComponent(initialComponent);
  }, [initialComponent]);
/*
const handleHomeClick = () => {
    // Aqui você pode validar o token/sessionStorage se quiser
    const user = sessionStorage.getItem('user');
    if (user) {
      setActiveComponent("ShowCase");
      //setActiveSub(undefined);
    }
  };
*/  
  return (
    <div className="people-department-container">
      <Header
        menus={peopleMenus}
        showTooltip={showTooltip}
        setShowTooltip={setShowTooltip}
        notificationCount={notificationCount}
        onOpenChat={onOpenChat}
        onMenuClick={onMenuClick}
        activeMenu={activeMenu}
        onHomeClick={() => onComponentChange("ShowCase")}
      />
      <div className="people-department-table">
        {/* Renderização dinâmica do subcomponente */}
        {componentMap[activeComponent] || <ApprovalRequest />}
      </div>
    </div>
  );
};

export default PeopleDepartmentManagement;
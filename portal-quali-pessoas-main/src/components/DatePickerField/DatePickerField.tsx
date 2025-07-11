import React, { useState, useRef } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Popover,
  Box,
  Button,
  Typography
} from '@mui/material';
import { DateRange, Today, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { formatDateToBR, parseBRDate } from '../../utils/maskUtils';

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  required?: boolean;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  error = false,
  helperText = '',
  disabled = false,
  fullWidth = true,
  required = false
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const textFieldRef = useRef<HTMLInputElement>(null);

  const open = Boolean(anchorEl);

  const handleDateIconClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    
    // Aplica máscara de data
    let maskedValue = inputValue.replace(/\D/g, '');
    if (maskedValue.length >= 2) {
      maskedValue = maskedValue.slice(0, 2) + '/' + maskedValue.slice(2);
    }
    if (maskedValue.length >= 5) {
      maskedValue = maskedValue.slice(0, 5) + '/' + maskedValue.slice(5, 9);
    }
    
    onChange(maskedValue);
  };

  const handleDateSelect = (date: Date) => {
    const formattedDate = formatDateToBR(date);
    onChange(formattedDate);
    handleClose();
  };

  const handleTodayClick = () => {
    handleDateSelect(new Date());
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior para preencher o início
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Dias do próximo mês para preencher o final
    const remainingCells = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  const selectedDate = parseBRDate(value);

  return (
    <>
      <TextField
        ref={textFieldRef}
        label={required ? `${label} *` : label}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        fullWidth={fullWidth}
        variant="outlined"
        error={error}
        helperText={helperText}
        disabled={disabled}
        inputProps={{
          maxLength: 10
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleDateIconClick}
                disabled={disabled}
                size="small"
              >
                <DateRange />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          {/* Header do calendário */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <IconButton onClick={() => navigateMonth('prev')} size="small">
              <NavigateBefore />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={600}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Typography>
            <IconButton onClick={() => navigateMonth('next')} size="small">
              <NavigateNext />
            </IconButton>
          </Box>

          {/* Dias da semana */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, mb: 1 }}>
            {weekDays.map((day) => (
              <Box key={day} sx={{ textAlign: 'center', py: 0.5 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  {day}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Dias do mês */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
            {days.map((day, index) => {
              const isToday = day.date.toDateString() === today.toDateString();
              const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
              
              return (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    onClick={() => handleDateSelect(day.date)}
                    size="small"
                    sx={{
                      minWidth: 0,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: isSelected ? 'primary.main' : 'transparent',
                      color: isSelected ? 'primary.contrastText' : (day.isCurrentMonth ? 'text.primary' : 'text.disabled'),
                      border: isToday && !isSelected ? '1px solid' : 'none',
                      borderColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                      }
                    }}
                  >
                    <Typography variant="body2" fontSize={12}>
                      {day.date.getDate()}
                    </Typography>
                  </Button>
                </Box>
              );
            })}
          </Box>

          {/* Botão Hoje */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              onClick={handleTodayClick}
              startIcon={<Today />}
              size="small"
              variant="outlined"
            >
              Hoje
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default DatePickerField;

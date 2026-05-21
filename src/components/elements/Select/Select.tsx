import type { ChangeEvent, SelectHTMLAttributes } from "react";
import styles from "./Select.module.scss";

type SelectValue = string | number;

export type SelectOption<TValue extends SelectValue = string> = {
  label: string;
  value: TValue;
  disabled?: boolean;
};

export type SelectProps<TValue extends SelectValue = string> = {
  value: TValue | "";
  options: SelectOption<TValue>[];
  onChange: (value: TValue | "", event: ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange" | "disabled" | "className" | "name">;

const Select = <TValue extends SelectValue = string>({
  value,
  options,
  onChange,
  placeholder,
  label,
  disabled = false,
  className = "",
  name,
  id,
  ...selectProps
}: SelectProps<TValue>) => {
  const selectId = id ?? name;
  const rootClassName = [styles.field, className].filter(Boolean).join(" ");

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = options.find((option) => String(option.value) === event.target.value);
    onChange(selectedOption ? selectedOption.value : "", event);
  };

  return (
    <label className={rootClassName} htmlFor={selectId}>
      {label && <span className={styles.label}>{label}</span>}

      <select
        {...selectProps}
        id={selectId}
        name={name}
        className={styles.select}
        value={String(value)}
        onChange={handleChange}
        disabled={disabled}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default Select;

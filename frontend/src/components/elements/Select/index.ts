import type {ChangeEvent, SelectHTMLAttributes} from "react";

export type SelectValue = string | number;

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
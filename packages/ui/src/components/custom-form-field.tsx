import { Control, Controller } from "react-hook-form";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/utils";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Textarea } from "@repo/ui/components/textarea";
import { Calendar } from "@repo/ui/components/calendar";
import { Slider } from "@repo/ui/components/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import React, { useState } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@repo/ui/components/field";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@repo/ui/components/input-group";

enum FormFieldType {
  INPUT = "input",
  CHECKBOX = "checkbox",
  SELECT = "select",
  TEXTAREA = "textarea",
  DATE_PICKER = "datePicker",
  SKELETON = "skeleton",
  RADIO_GROUP = "radiogroup",
  INPUT_GROUP = "inputGroup",
  SLIDER = "slider",
}

interface CustomFormFieldProps {
  control: Control<any>;
  fieldType: FormFieldType;
  inputType?: "text" | "email" | "tel" | "password" | "number";
  name: string;
  label?: React.ReactNode;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  defaultValue?: string;
  children?: React.ReactNode;
  inputGroupIcon?: React.ReactNode;
  inputGroupText?: string;
  inputGroupTextPosition?: "left" | "right";
  ariaLabel?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
  wrapperClassName?: string;
}

const RenderField = ({
  props,
  field,
}: {
  props: CustomFormFieldProps;
  field: any;
}) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  switch (props.fieldType) {
    case FormFieldType.INPUT:
      return (
        <Input
          {...field}
          type={props.inputType}
          placeholder={props.placeholder}
          disabled={props.disabled}
          className={cn(
            props.className,
            props.inputType === "number" &&
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          )}
          onChange={(e) => {
            if (props.inputType === "number") {
              try {
                field.onChange(e.target.value);
              } catch {}
            } else {
              field.onChange(e);
            }
          }}
        />
      );

    case FormFieldType.INPUT_GROUP:
      return (
        <InputGroup>
          <InputGroupInput
            {...field}
            type={props.inputType}
            placeholder={props.placeholder}
            disabled={props.disabled}
            className={cn(
              props.className,
              props.inputType === "number" &&
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            )}
            onChange={(e) => {
              if (props.inputType === "number") {
                try {
                  field.onChange(e.target.value);
                } catch {}
              } else {
                field.onChange(e);
              }
            }}
          />
          {props.inputGroupIcon && (
            <InputGroupAddon>{props.inputGroupIcon}</InputGroupAddon>
          )}
          {props.inputGroupText && (
            <InputGroupAddon align="inline-end">
              <InputGroupText>{props.inputGroupText}</InputGroupText>
            </InputGroupAddon>
          )}
        </InputGroup>
      );

    case FormFieldType.TEXTAREA:
      return (
        <Textarea
          {...field}
          placeholder={props.placeholder}
          className={cn(props.className)}
          disabled={props.disabled}
        />
      );

    case FormFieldType.SELECT:
      return (
        <Select
          value={field.value}
          defaultValue={props.defaultValue}
          onValueChange={field.onChange}
          disabled={props.disabled}
        >
          <SelectTrigger
            className={cn(props.className)}
            aria-label={props.ariaLabel}
          >
            <SelectValue placeholder={props.placeholder} />
          </SelectTrigger>
          <SelectContent>{props.children}</SelectContent>
        </Select>
      );

    case FormFieldType.CHECKBOX:
      return (
        <FieldGroup key={props.name}>
          <Field orientation="horizontal">
            <Checkbox
              id={props.name}
              name={props.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={props.disabled}
            />
            <FieldLabel htmlFor={props.name}>{props.label}</FieldLabel>
          </Field>
        </FieldGroup>
      );

    case FormFieldType.RADIO_GROUP:
      return (
        <RadioGroup
          defaultValue={field.value}
          onValueChange={field.onChange}
          disabled={props.disabled}
          className={cn("flex", props.className)}
        >
          {props.options?.map((option) => (
            <Field key={option.value} orientation="horizontal">
              <RadioGroupItem value={option.value} id={option.value} />
              <FieldLabel htmlFor={option.value}>{option.label}</FieldLabel>
            </Field>
          ))}
        </RadioGroup>
      );

    case FormFieldType.DATE_PICKER:
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              className="justify-start font-normal"
            >
              {date ? date.toLocaleDateString() : props.placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              defaultMonth={date}
              captionLayout="dropdown"
              onSelect={(date) => {
                setDate(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      );

    case FormFieldType.SLIDER:
      return (
        <div className={cn(props.className)}>
          <Slider
            min={props.min}
            max={props.max}
            step={props.step}
            defaultValue={field.value}
            onValueChange={field.onChange}
            className="py-2"
          />
          {props.children && <div className="mt-4">{props.children}</div>}
        </div>
      );

    default:
      return null;
  }
};

const CustomFormField = (props: CustomFormFieldProps) => {
  return (
    <Controller
      name={props.name}
      control={props.control}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className={props.wrapperClassName}
        >
          {props.fieldType !== FormFieldType.CHECKBOX && props.label && (
            <FieldLabel htmlFor={field.name}>{props.label}</FieldLabel>
          )}
          <RenderField props={props} field={field} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export { CustomFormField, FormFieldType };

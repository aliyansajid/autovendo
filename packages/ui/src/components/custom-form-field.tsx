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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import { useState } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
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
}

interface CustomFormFieldProps {
  control: Control<any>;
  fieldType: FormFieldType;
  inputType?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "url"
    | "color"
    | "date";
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  defaultValue?: string;
  children?: React.ReactNode;
  renderSkeleton?: (field: any) => React.ReactNode;
  dateFormat?: string;
  showTimeSelect?: boolean;
  inputGroupText?: React.ReactNode;
  inputGroupTextPosition?: "left" | "right";
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
        <InputGroup className={cn(props.className)}>
          {props.inputGroupText &&
            (!props.inputGroupTextPosition ||
              props.inputGroupTextPosition === "left") && (
              <InputGroupAddon>
                <InputGroupText>{props.inputGroupText}</InputGroupText>
              </InputGroupAddon>
            )}
          <InputGroupInput
            {...field}
            type={props.inputType}
            placeholder={props.placeholder}
            disabled={props.disabled}
            className={cn(
              "text-right",
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
          {props.inputGroupText && props.inputGroupTextPosition === "right" && (
            <InputGroupAddon>
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
          <SelectTrigger className={cn(props.className)}>
            <SelectValue placeholder={props.placeholder} />
          </SelectTrigger>
          <SelectContent>{props.children}</SelectContent>
        </Select>
      );

    case FormFieldType.CHECKBOX:
      return (
        <FieldGroup>
          <Field orientation="horizontal">
            <Checkbox
              id={props.name}
              name={props.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={props.disabled}
              className={cn(props.className)}
            />
            <FieldLabel htmlFor={props.name}>{props.label}</FieldLabel>
          </Field>
        </FieldGroup>
      );

    case FormFieldType.RADIO_GROUP:
      return (
        <RadioGroup defaultValue="option-one">
          <div className="flex items-center gap-3">
            <RadioGroupItem value="option-one" id="option-one" />
            <Label htmlFor="option-one">Option One</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="option-two" id="option-two" />
            <Label htmlFor="option-two">Option Two</Label>
          </div>
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
        <Field data-invalid={fieldState.invalid}>
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

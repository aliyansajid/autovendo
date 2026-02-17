import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Control } from "react-hook-form";
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
import { Field, FieldGroup } from "@repo/ui/components/field";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";

enum FormFieldType {
  INPUT = "input",
  CHECKBOX = "checkbox",
  SELECT = "select",
  TEXTAREA = "textarea",
  DATE_PICKER = "datePicker",
  SKELETON = "skeleton",
  RADIO_GROUP = "radiogroup",
  CHECKBOX_GROUP = "checkboxGroup",
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
          placeholder={props.placeholder}
          type={props.inputType}
          className={cn(props.className)}
          disabled={props.disabled}
          onChange={(e) => {
            if (props.inputType === "number") {
              const val = e.target.value;
              try {
                field.onChange(e.target.value);
              } catch {}
            } else {
              field.onChange(e);
            }
          }}
        />
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
          onValueChange={field.onChange}
          value={field.value}
          disabled={props.disabled}
          defaultValue={props.defaultValue}
        >
          <SelectTrigger className={props.className}>
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
            <Label htmlFor={props.name}>{props.label}</Label>
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
              {date ? date.toLocaleDateString() : "Select date"}
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

    case FormFieldType.SKELETON:
      return props.renderSkeleton ? props.renderSkeleton(field) : null;

    default:
      return null;
  }
};

const CustomFormField = (props: CustomFormFieldProps) => {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem>
          {props.fieldType !== FormFieldType.CHECKBOX && props.label && (
            <FormLabel>{props.label}</FormLabel>
          )}
          <RenderField props={props} field={field} />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export { CustomFormField, FormFieldType };

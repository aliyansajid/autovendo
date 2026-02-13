import {
  FormControl,
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

enum FormFieldType {
  INPUT = "input",
  CHECKBOX = "checkbox",
  SELECT = "select",
}

interface CustomFormFieldProps {
  control: Control<any>;
  fieldType: FormFieldType;
  inputType?: "text" | "email" | "password" | "number" | "url" | "color";
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  defaultValue?: string;
  children?: React.ReactNode;
}

const RenderField = ({
  props,
  field,
}: {
  props: CustomFormFieldProps;
  field: any;
}) => {
  switch (props.fieldType) {
    case FormFieldType.INPUT:
      return (
        <Input
          placeholder={props.placeholder}
          type={props.inputType}
          className={cn(props.className)}
          disabled={props.disabled}
          {...field}
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
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={props.disabled}
            className={props.className}
            id={props.name}
          />
          <label
            htmlFor={props.name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {props.label}
          </label>
        </div>
      );

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
          {props.fieldType != FormFieldType.CHECKBOX && props.label && (
            <FormLabel>{props.label}</FormLabel>
          )}
          <FormControl>
            <RenderField props={props} field={field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export { CustomFormField, FormFieldType };

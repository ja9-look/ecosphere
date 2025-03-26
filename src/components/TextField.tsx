import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  InputProps,
} from "@mui/joy";
import { forwardRef } from "react";

export interface TextFieldProps extends InputProps {
  label?: string;
  helperText?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, helperText, ...props }, ref) => {
    return (
      <FormControl
        id={props.id}
        error={props.error}
        className="w-full"
      >
        <FormLabel className="text-sm">{label}</FormLabel>
        <Input
          className="text-lg"
          ref={ref}
          size="lg"
          {...props}
        />
        <FormHelperText>
          {/* {props.error && ( 
            <InformationCircleIcon
              width={20}
              className="text-red"
            />
          )} */}
          {helperText}
        </FormHelperText>
      </FormControl>
    );
  }
);

TextField.displayName = "TextField";

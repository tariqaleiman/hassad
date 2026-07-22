import React, { forwardRef, useState, useEffect, useRef, type SelectHTMLAttributes } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, value: externalValue, defaultValue, onChange, onBlur, ...props }, forwardedRef) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | number | readonly string[]>(externalValue ?? defaultValue ?? "");
  const containerRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);

  // Sync external ref
  useEffect(() => {
    if (typeof forwardedRef === "function") {
      forwardedRef(selectRef.current);
    } else if (forwardedRef) {
      forwardedRef.current = selectRef.current;
    }
  }, [forwardedRef]);

  // Handle external value changes (for controlled forms or useWatch)
  useEffect(() => {
    if (externalValue !== undefined) {
      setInternalValue(externalValue);
    }
  }, [externalValue]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen && onBlur) {
          // Trigger blur when closing by clicking outside
          if (selectRef.current) {
             const blurEvent = new Event("blur", { bubbles: true });
             selectRef.current.dispatchEvent(blurEvent);
          }
        }
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onBlur]);

  const options: { value: string; label: React.ReactNode; disabled?: boolean; group?: string; isGroupLabel?: boolean }[] = [];
  
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    
    if (child.type === "option") {
      const element = child as React.ReactElement<any>;
      options.push({
        value: String(element.props.value ?? element.props.children),
        label: element.props.children,
        disabled: element.props.disabled,
      });
    } else if (child.type === "optgroup") {
      const groupElement = child as React.ReactElement<any>;
      const groupLabel = groupElement.props.label;
      
      // Add group label as a non-selectable option
      if (groupLabel) {
        options.push({
          value: `__group_${groupLabel}`,
          label: groupLabel,
          disabled: true,
          isGroupLabel: true,
        });
      }
      
      // Process children of optgroup
      React.Children.forEach(groupElement.props.children, (optChild) => {
        if (React.isValidElement(optChild) && optChild.type === "option") {
          const optElement = optChild as React.ReactElement<any>;
          options.push({
            value: String(optElement.props.value ?? optElement.props.children),
            label: optElement.props.children,
            disabled: optElement.props.disabled,
            group: groupLabel,
          });
        }
      });
    }
  });

  const selectedOption = options.find((opt) => opt.value === String(internalValue)) || options[0];

  const handleSelect = (val: string) => {
    setInternalValue(val);
    setIsOpen(false);
    
    // Update native select and trigger React Hook Form's change event
    if (selectRef.current) {
      selectRef.current.value = val;
      
      // We must dispatch a native event so React's synthetic event system catches it
      const event = new Event("change", { bubbles: true });
      
      // Override the defineProperty setter hack used by React 16+ to force it to notice the change
      const tracker = (selectRef.current as any)._valueTracker;
      if (tracker) {
        tracker.setValue(val);
      }
      
      selectRef.current.dispatchEvent(event);
      
      if (onChange) {
        onChange({
          target: selectRef.current,
          currentTarget: selectRef.current,
        } as unknown as React.ChangeEvent<HTMLSelectElement>);
      }
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Hidden native select for native form integration & accessibility */}
      <select
        ref={selectRef}
        value={internalValue}
        onChange={(e) => {
          setInternalValue(e.target.value);
          if (onChange) onChange(e);
        }}
        onBlur={onBlur}
        className="opacity-0 absolute inset-0 w-full h-full -z-10 cursor-pointer pointer-events-none"
        tabIndex={-1}
        {...props}
      >
        {children}
      </select>

      {/* Custom Trigger */}
      <button
        type="button"
        disabled={props.disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-border/80 bg-paper-raised px-4 text-sm text-ink transition-all shadow-sm focus:outline-none focus:border-crop-600 focus:ring-4 focus:ring-crop-600/20 disabled:cursor-not-allowed disabled:bg-paper-sunken/50 disabled:opacity-70 hover:border-border",
          isOpen && "border-crop-600 ring-4 ring-crop-600/20",
          className
        )}
      >
        <span className="truncate">{selectedOption?.label ?? "اختر..."}</span>
        <ChevronDown className={cn("h-4 w-4 text-ink-faint shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto overflow-x-hidden rounded-2xl border border-glass-border bg-paper-raised/95 backdrop-blur-xl p-1.5 shadow-xl shadow-black/5 dark:shadow-black/20 animate-in fade-in zoom-in-95 duration-200">
          {options.length === 0 ? (
            <div className="p-3 text-center text-sm text-ink-muted">لا توجد خيارات</div>
          ) : (
            options.map((opt, i) => (
              opt.isGroupLabel ? (
                <div key={i} className="px-3 py-2 text-xs font-semibold text-ink-muted bg-paper-sunken/50 mt-1 first:mt-0 rounded-md">
                  {opt.label}
                </div>
              ) : (
                <button
                  key={i}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 px-3 text-sm outline-none transition-colors hover:bg-paper-sunken focus:bg-paper-sunken",
                    opt.disabled && "opacity-50 cursor-not-allowed",
                    opt.value === String(internalValue) 
                      ? "text-crop-600 bg-crop-50/60 dark:bg-crop-500/10 font-bold" 
                      : "text-ink",
                    opt.group && "ps-6" // Indent items inside a group
                  )}
                >
                  <span className="truncate text-start pe-6">{opt.label}</span>
                  {opt.value === String(internalValue) && (
                    <Check className="absolute end-3 h-4 w-4 text-crop-600" />
                  )}
                </button>
              )
            ))
          )}
        </div>
      )}
    </div>
  );
});
Select.displayName = "Select";

"use client";

import { createContext, useContext, useId, useState, type FormEvent, type ReactNode, type Ref } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { defaultGenerativeUILibrary, renderGenerativeUI, type GenerativeUIAction, type GenerativeUILibrary } from "@assistant-ui/generative-ui/react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useButtonFeedback } from "@/components/ui/use-button-feedback";
import type { ButtonFeedbackStatus } from "@/components/ui/button-feedback-state";
import type { GalleryTemplate } from "./gallery-templates";
import { cn } from "@/lib/cva.config";
import styles from "./generative.module.css";

type Host = {
  disabled: boolean;
  busy: boolean;
  buttonStatus: (id: string) => ButtonFeedbackStatus;
  perform: (action: GenerativeUIAction, id: string, source?: HTMLElement) => void;
  cancel: (source?: HTMLElement) => void;
};
const HostContext = createContext<Host | null>(null);
function useHost() {
  const host = useContext(HostContext);
  if (!host) throw new Error("Generative components require their local preview host.");
  return host;
}

const text = (value: unknown) => typeof value === "string" || typeof value === "number" ? String(value) : "";
type Option = { label: string; value: string };
const optionsOf = (value: unknown): Option[] => (Array.isArray(value) ? value : []).filter((entry): entry is Option => entry !== null && typeof entry === "object" && typeof entry.label === "string" && typeof entry.value === "string");

/** The fixed gallery forms use date-only fields, string controls, radios and boolean checkboxes. */
export function collectGalleryForm(form: HTMLFormElement): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const control of Array.from(form.elements)) {
    if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) || !control.name || control.matches(":disabled")) continue;
    if (control.type === "radio") {
      if ((control as HTMLInputElement).checked) values[control.name] = control.value;
      else if (!Object.hasOwn(values, control.name)) values[control.name] = undefined;
      continue;
    }
    const value = control.type === "checkbox" ? (control as HTMLInputElement).checked : control.value;
    if (Object.hasOwn(values, control.name)) {
      const previous = values[control.name];
      values[control.name] = Array.isArray(previous) ? [...previous, value] : [previous, value];
    } else values[control.name] = value;
  }
  return values;
}

type ActionButtonProps = {
  label: unknown;
  action?: GenerativeUIAction;
  children?: ReactNode;
  submit?: boolean;
  cancel?: boolean;
  block?: boolean;
  buttonStyle?: string;
  slot?: string;
};
function ActionButton({ label, action, children, submit, cancel, block, buttonStyle, slot = "button" }: ActionButtonProps) {
  const host = useHost(), id = useId();
  const status = host.buttonStatus(id);
  const canCancel = cancel || action?.type === "discard_email" || action?.type === "cancel_delete";
  const variant: ButtonProps["variant"] = ({primary:"default",danger:"destructive",secondary:"secondary",outline:"outline",ghost:"ghost"} as Record<string, ButtonProps["variant"]>)[buttonStyle ?? "secondary"] ?? "secondary";
  return <Button data-aui={slot} data-generative-trigger={id} data-generative-action={action ? JSON.stringify(action) : undefined} type={submit ? "submit" : "button"} variant={variant} className={block ? "w-full" : undefined} disabled={host.disabled || (host.busy && !canCancel)} focusableWhenDisabled aria-busy={status === "loading" || undefined} onClick={event => {
    if (cancel) host.cancel(event.currentTarget);
    else if (!submit && action) host.perform(action, id, event.currentTarget);
  }}><ButtonFeedbackIcon status={status} />{text(label)}{children}</Button>;
}

function submitGallery(event: FormEvent<HTMLFormElement>, action: GenerativeUIAction | undefined, host: Host) {
  event.preventDefault();
  if (!action || host.disabled || host.busy) return;
  const submitter = (event.nativeEvent as SubmitEvent).submitter ?? event.currentTarget.querySelector<HTMLButtonElement>('button[type="submit"][data-generative-trigger]');
  const id = submitter?.getAttribute("data-generative-trigger") ?? "form";
  host.perform({ ...action, $input: collectGalleryForm(event.currentTarget) }, id, submitter instanceof HTMLElement ? submitter : event.currentTarget);
}

type CardProps = {
  title?: unknown;
  children?: ReactNode;
  asForm?: boolean;
  confirm?: { label: unknown; $action?: GenerativeUIAction };
  cancel?: { label: unknown; $action?: GenerativeUIAction };
  $action?: GenerativeUIAction;
};
function GalleryCard({ title, children, asForm, confirm, cancel, $action }: CardProps) {
  const host = useHost();
  const card = <Card data-aui="card" className="w-full">
    {text(title) ? <CardHeader><CardTitle data-aui="card-title">{text(title)}</CardTitle></CardHeader> : null}
    <CardContent className="flex min-w-0 flex-col gap-4">{children}</CardContent>
    {confirm || cancel ? <CardFooter data-aui="card-footer" className="flex-wrap justify-end gap-2">
      {confirm ? <ActionButton label={confirm.label} action={confirm.$action} submit={asForm} buttonStyle="primary" slot="card-confirm" /> : null}
      {cancel ? <ActionButton label={cancel.label} action={cancel.$action} cancel={!cancel.$action} buttonStyle="ghost" slot="card-cancel" /> : null}
    </CardFooter> : null}
  </Card>;
  return asForm ? <form data-aui="form" className="w-full min-w-0" onSubmit={event => submitGallery(event, confirm?.$action ?? $action, host)}>{card}</form> : card;
}

function GalleryForm({ $action, children }: { $action?: GenerativeUIAction; children?: ReactNode }) {
  const host = useHost();
  return <form data-aui="form" onSubmit={event => submitGallery(event, $action, host)}>{children}</form>;
}

type FieldProps = { label?: string; name?: string; placeholder?: string; defaultValue?: string; inputType?: "text" | "password" | "number"; multiline?: boolean };
function GalleryInput({ label, name, placeholder, defaultValue, inputType = "text", multiline }: FieldProps) {
  const host = useHost(), id = useId();
  return <div data-generative-field className="flex w-full min-w-0 flex-col gap-2">{label ? <Label htmlFor={id}>{label}</Label> : null}
    {multiline && inputType === "text" ? <textarea id={id} data-aui="input" data-aui-multiline name={name} aria-label={label ?? placeholder} placeholder={placeholder} defaultValue={defaultValue} disabled={host.disabled || host.busy} rows={4} className="min-h-24 w-full min-w-0 resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none" onKeyDown={event => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
      : <Input id={id} data-aui="input" name={name} type={inputType} placeholder={placeholder} aria-label={label ?? placeholder} defaultValue={defaultValue} disabled={host.disabled || host.busy} />}
  </div>;
}

function GalleryDate({ label, name, value, min, max }: {label?: string; name?: string; value?: string; min?: string; max?: string}) {
  const host = useHost(), id = useId();
  return <div data-generative-field className="flex w-full min-w-0 flex-col gap-2">{label ? <Label htmlFor={id}>{label}</Label> : null}<Input id={id} type="date" data-aui="datepicker" name={name} defaultValue={value} min={min} max={max} aria-label={label} disabled={host.disabled || host.busy} /></div>;
}

function GallerySelect({ label, name, placeholder, defaultValue, options }: {label?:string; name?:string; placeholder?:string; defaultValue?:string; options?:unknown}) {
  const host = useHost(), id = useId(), choices = optionsOf(options);
  return <div data-generative-field data-aui="select-field" className="flex w-full min-w-0 flex-col gap-2">{label ? <Label htmlFor={id}>{label}</Label> : null}
    <Combobox items={choices.map(item => item.value)} name={name} defaultValue={defaultValue ?? null} itemToStringLabel={value => choices.find(item => item.value === value)?.label ?? value} disabled={host.disabled || host.busy || choices.length === 0}>
      <ComboboxInput id={id} aria-label={label} placeholder={placeholder} disabled={host.disabled || host.busy || choices.length === 0} />
      <ComboboxContent><ComboboxEmpty>没有可选项</ComboboxEmpty><ComboboxList>{(value: string) => <ComboboxItem key={value} value={value}>{choices.find(item => item.value === value)?.label ?? value}</ComboboxItem>}</ComboboxList></ComboboxContent>
    </Combobox>
  </div>;
}

function GalleryCheckbox({ label, name, defaultChecked }: { label?:unknown; name?:string; defaultChecked?:boolean }) {
  const host = useHost(), id = useId();
  const disabled = host.disabled || host.busy;
  return <div data-aui="checkbox" className="flex min-w-0 items-center gap-2"><Checkbox id={id} name={name} defaultChecked={defaultChecked} disabled={disabled} /><Label htmlFor={id} className={cn("min-w-0 leading-normal", !disabled && "cursor-pointer")}>{text(label)}</Label></div>;
}

function GalleryRadios({ label, name, defaultValue, options }: {label?:string;name?:string;defaultValue?:string;options?:unknown}) {
  const host = useHost(), id = useId();
  return <fieldset data-aui="radiogroup" aria-label={label} disabled={host.disabled || host.busy} className="flex min-w-0 flex-col items-start gap-3">{label ? <legend className="mb-2 text-sm font-medium">{label}</legend> : null}{optionsOf(options).map(option => <Label key={option.value} className="leading-normal"><input type="radio" name={name ?? id} value={option.value} defaultChecked={option.value === defaultValue} className="size-4 shrink-0 accent-primary enabled:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" />{option.label}</Label>)}</fieldset>;
}

function GalleryListItem({ $action, children }: {$action?:GenerativeUIAction;children?:ReactNode}) {
  const host = useHost(), id = useId();
  if (!$action) return <li data-aui="listview-item">{children}</li>;
  const status = host.buttonStatus(id);
  return <li data-aui="listview-item"><div data-aui="listview-item-trigger" className="relative" onClick={event => {
    if (event.target instanceof Element && event.target.closest("button, a, input, select, textarea, [role=button]")) return;
    if (!host.disabled && !host.busy) host.perform($action, id, event.currentTarget);
  }}>
    <Button variant="ghost" type="button" aria-labelledby={`${id}-content`} className="absolute inset-0 size-full" disabled={host.disabled || host.busy} focusableWhenDisabled aria-busy={status === "loading" || undefined} onClick={event => host.perform($action, id, event.currentTarget)}><span className="sr-only">选择</span></Button>
    <div data-aui="listview-item-content" id={`${id}-content`} className="pointer-events-none relative [&_button]:pointer-events-auto">{children}{status !== "idle" ? <span className="absolute top-0 right-0"><ButtonFeedbackIcon status={status} /></span> : null}</div>
  </div></li>;
}

function GalleryImage({ src, alt = "", size, round }: {src?:string;alt?:string;size?:string|number;round?:boolean}) {
  const host = useHost(), retry = useButtonFeedback();
  const [failed, setFailed] = useState(false), [version, setVersion] = useState(0);
  const imageProps = {"data-aui":"image", "data-aui-size":typeof size === "string" ? size : undefined, "data-aui-round":round || undefined};
  if (failed) return <div data-generative-image-error className="flex min-w-0 max-w-full flex-col items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs"><span role="status">{retry.status === "success" ? "原图已加载，即将显示" : "图片加载失败"}{alt ? `：${alt}` : ""}</span><Button variant="outline" size="sm" disabled={host.disabled || retry.busy} aria-busy={retry.loading || undefined} onClick={() => void retry.run(signal => new Promise<boolean>(resolve => {
    if (!src) { resolve(false); return; }
    const image = new window.Image();
    const finish = (success:boolean) => { image.onload = null; image.onerror = null; signal.removeEventListener("abort", cancel); resolve(success); };
    const cancel = () => { image.src = ""; finish(false); };
    image.onload = () => finish(true); image.onerror = () => finish(false); signal.addEventListener("abort", cancel, {once:true}); image.src = src;
  }), { onSuccessFeedbackEnd: () => { setVersion(value => value + 1); setFailed(false); } })}><ButtonFeedbackIcon status={retry.buttonStatus()} />重试原图</Button></div>;
  // The source URLs are intentionally retained instead of proxying or replacing the reference photographs.
  // eslint-disable-next-line @next/next/no-img-element
  return <img key={version} {...imageProps} src={src} alt={alt} ref={image => { if (image?.complete && image.naturalWidth === 0) setFailed(true); }} onError={() => setFailed(true)} style={typeof size === "number" ? {width:size,height:round?size:undefined} : undefined} />;
}

const markdownBase = defaultGenerativeUILibrary.Markdown!;
const originalTable = defaultGenerativeUILibrary.Table!;
const library: GenerativeUILibrary = {
  ...defaultGenerativeUILibrary,
  Card: { ...defaultGenerativeUILibrary.Card!, render: props => <GalleryCard {...props} /> },
  Form: { ...defaultGenerativeUILibrary.Form!, render: props => <GalleryForm {...props} /> },
  Button: { ...defaultGenerativeUILibrary.Button!, render: ({$action,...props}) => <ActionButton {...props} action={$action} /> },
  Input: { ...defaultGenerativeUILibrary.Input!, render: props => <GalleryInput {...props} /> },
  DatePicker: { ...defaultGenerativeUILibrary.DatePicker!, render: props => <GalleryDate {...props} /> },
  Select: { ...defaultGenerativeUILibrary.Select!, render: props => <GallerySelect {...props} /> },
  Checkbox: { ...defaultGenerativeUILibrary.Checkbox!, render: props => <GalleryCheckbox {...props} /> },
  RadioGroup: { ...defaultGenerativeUILibrary.RadioGroup!, render: props => <GalleryRadios {...props} /> },
  ListViewItem: { ...defaultGenerativeUILibrary.ListViewItem!, render: props => <GalleryListItem {...props} /> },
  Image: { ...defaultGenerativeUILibrary.Image!, render: props => <GalleryImage {...props} /> },
  Badge: { ...defaultGenerativeUILibrary.Badge!, render: ({value,variant,children}) => <Badge data-aui="badge" variant={({info:"secondary",success:"success",warning:"warning",danger:"danger"} as Record<string,BadgeProps["variant"]>)[variant] ?? "secondary"}>{text(value)}{children}</Badge> },
  Alert: { ...defaultGenerativeUILibrary.Alert!, render: ({title,description,tone}) => <div data-aui="alert" data-aui-tone={tone} role="status" className={cn("flex min-w-0 flex-col gap-1 rounded-lg border p-3",({success:"border-success/20 bg-success/10",warning:"border-warning/20 bg-warning/10",danger:"border-destructive/20 bg-destructive/10",info:"border-primary/20 bg-primary/5"} as Record<string,string>)[tone] ?? "border-border bg-muted/40")}><p data-aui="alert-title" className="text-sm font-medium">{text(title)}</p><p data-aui="alert-desc" className="text-sm text-muted-foreground">{text(description)}</p></div> },
  Table: { ...originalTable, render: ({columns,rows}) => <Table data-aui="table"><TableHeader><TableRow>{(Array.isArray(columns) ? columns : []).map((column: {label?:unknown},index:number) => <TableHead key={index}>{text(column.label)}</TableHead>)}</TableRow></TableHeader><TableBody>{(Array.isArray(rows) ? rows : []).map((row:unknown[],index:number) => <TableRow key={index}>{row.map((cell,cellIndex) => <TableCell key={cellIndex}>{text(cell)}</TableCell>)}</TableRow>)}</TableBody></Table> },
  Markdown: { properties:markdownBase.properties,streamProperties:markdownBase.streamProperties,description:markdownBase.description,render:({value,children}) => <div data-aui="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{text(value)}</ReactMarkdown>{children}</div> },
};

export function GenerativeTemplate({tree,host,slug,rootRef}:{tree:GalleryTemplate["tree"];host:Host;slug:string;rootRef?:Ref<HTMLDivElement>}) {
  return <HostContext.Provider value={host}><div ref={rootRef} data-generative-template={slug} className={cn(styles.root,"w-full min-w-0")}><fieldset disabled={host.disabled} className="m-0 w-full min-w-0 border-0 p-0">{renderGenerativeUI(tree, library, {status:"done",dispatch:action => host.perform(action,"source")})}</fieldset></div></HostContext.Provider>;
}

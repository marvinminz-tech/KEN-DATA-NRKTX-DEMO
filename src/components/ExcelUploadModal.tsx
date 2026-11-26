import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: () => void;
}

type ValidationState = "idle" | "validating" | "success" | "error";

interface ValidationError {
  row: number;
  column: string;
  error: string;
}

export default function ExcelUploadModal({ open, onClose, onImport }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ValidationState>("idle");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => { setFile(null); setState("idle"); setErrors([]); };

  const handleClose = () => { reset(); onClose(); };

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".xlsx")) return;
    setFile(f);
    setState("idle");
    setErrors([]);
  };

  const handleValidate = () => {
    setState("validating");
    // Simulate validation
    setTimeout(() => {
      const hasErrors = Math.random() > 0.6;
      if (hasErrors) {
        setErrors([
          { row: 5, column: "Incremental Units CW12", error: "Value must be a positive number" },
          { row: 8, column: "Planned Promo Price CW20", error: "Price cannot exceed List Price" },
        ]);
        setState("error");
      } else {
        setErrors([]);
        setState("success");
      }
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Excel</DialogTitle>
          <DialogDescription>Upload a .xlsx file to import planning data</DialogDescription>
        </DialogHeader>

        {/* Drop zone */}
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Drag & drop or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">.xlsx files only</p>
        </div>

        {file && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <Button size="sm" className="h-7 text-xs" onClick={handleValidate} disabled={state === "validating"}>
              {state === "validating" ? "Validating..." : "Upload & Validate"}
            </Button>
          </div>
        )}

        {state === "success" && (
          <div className="flex items-center gap-2 p-3 bg-status-published/10 rounded-md">
            <CheckCircle className="w-5 h-5 text-status-published" />
            <p className="text-sm text-status-published font-medium">All rows ready to import</p>
            <Button size="sm" className="h-7 text-xs ml-auto" onClick={onImport}>Confirm Import</Button>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
              <XCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive font-medium">{errors.length} error(s) found — fix and re-upload</p>
            </div>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-2 font-medium">Row</th>
                    <th className="text-left p-2 font-medium">Column</th>
                    <th className="text-left p-2 font-medium">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.map((e, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-2">{e.row}</td>
                      <td className="p-2">{e.column}</td>
                      <td className="p-2 text-destructive">{e.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

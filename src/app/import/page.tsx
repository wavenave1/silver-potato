"use client";
import { useRef, useState } from "react";
import Papa from "papaparse";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ACCOUNT_MAP, CONTACT_MAP, OPPORTUNITY_MAP } from "@/lib/dynamics-map";
import { Upload, Download, CheckCircle, AlertCircle, FileText, X } from "lucide-react";

type RecordType = "accounts" | "contacts" | "opportunities";

const TYPE_CONFIG: Record<RecordType, { label: string; map: Record<string, string>; hint: string }> = {
  accounts: {
    label: "Accounts",
    map: ACCOUNT_MAP,
    hint: "Export from Dynamics: Accounts → Export to Excel. Required column: Account Name.",
  },
  contacts: {
    label: "Contacts",
    map: CONTACT_MAP,
    hint: "Export from Dynamics: Contacts → Export to Excel. Required: First Name + Last Name (or Full Name).",
  },
  opportunities: {
    label: "Opportunities",
    map: OPPORTUNITY_MAP,
    hint: "Export from Dynamics: Opportunities → Export to Excel. Required column: Topic (Opportunity Name).",
  },
};

const EXPORT_TYPES: RecordType[] = ["accounts", "contacts", "opportunities"];

type ImportResult = { imported: number; skipped: number; errors: string[] };

export default function ImportPage() {
  const [activeType, setActiveType] = useState<RecordType>("accounts");
  const [rows, setRows] = useState<Record<string, string>[] | null>(null);
  const [filename, setFilename] = useState("");
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const config = TYPE_CONFIG[activeType];

  const handleFile = (file: File) => {
    setResult(null);
    setRows(null);
    setFilename(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        setRows(data);
        setPreview(data.slice(0, 3));
        // Auto-map columns
        const autoMap: Record<string, string> = {};
        for (const col of meta.fields ?? []) {
          const mapped = config.map[col.toLowerCase().trim()];
          if (mapped) autoMap[col] = mapped;
        }
        setColumnMap(autoMap);
      },
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const runImport = async () => {
    if (!rows) return;
    setImporting(true);
    setResult(null);
    // Apply column remapping to rows
    const remapped = rows.map(row => {
      const out: Record<string, string> = {};
      for (const [col, val] of Object.entries(row)) {
        const ourKey = columnMap[col];
        if (ourKey) out[ourKey] = val;
        else out[col] = val; // pass through unmapped columns too
      }
      return out;
    });
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: activeType, rows: remapped }),
    });
    const data = await res.json();
    setResult(data);
    setImporting(false);
  };

  const reset = () => {
    setRows(null);
    setPreview([]);
    setColumnMap({});
    setResult(null);
    setFilename("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const switchType = (t: RecordType) => {
    setActiveType(t);
    reset();
  };

  const allCols = preview.length > 0 ? Object.keys(preview[0]) : [];
  const mappedCount = Object.keys(columnMap).length;

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Import / Export</h1>
        <p className="text-gray-500 mt-1">Bring your data in from Dynamics, or download a backup anytime.</p>
      </div>

      {/* Export section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download size={16} className="text-gray-500" />
            <h2 className="font-semibold text-gray-800">Export</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Download your CRM data as CSV — open in Excel or import into any other tool.</p>
          <div className="flex flex-wrap gap-3">
            {EXPORT_TYPES.map(t => (
              <a
                key={t}
                href={`/api/export?type=${t}`}
                download
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
              >
                <Download size={14} />
                {TYPE_CONFIG[t].label} CSV
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload size={16} className="text-gray-500" />
            <h2 className="font-semibold text-gray-800">Import from Dynamics (CSV)</h2>
          </div>
        </CardHeader>
        <CardContent>
          {/* Type tabs */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit mb-5">
            {(Object.keys(TYPE_CONFIG) as RecordType[]).map(t => (
              <button
                key={t}
                onClick={() => switchType(t)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeType === t ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {TYPE_CONFIG[t].label}
              </button>
            ))}
          </div>

          <p className="text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2 mb-4">{config.hint}</p>

          {/* Drop zone */}
          {!rows && (
            <div
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              <FileText size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">Drop your CSV here, or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">Exported directly from Dynamics 365 — column names are auto-detected</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </div>
          )}

          {/* File loaded state */}
          {rows && !result && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-indigo-500" />
                  <span className="text-sm font-medium text-gray-700">{filename}</span>
                  <span className="text-xs text-gray-400">· {rows.length} rows · {mappedCount}/{allCols.length} columns mapped</span>
                </div>
                <button onClick={reset} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>

              {/* Column mapping */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Column Mapping</h3>
                <p className="text-xs text-gray-400 mb-3">Green = auto-detected from Dynamics headers. You can adjust any mapping below.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {allCols.map(col => {
                    const mapped = columnMap[col];
                    return (
                      <div key={col} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${mapped ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"}`}>
                        <span className="text-gray-500 truncate flex-1" title={col}>{col}</span>
                        <span className="text-gray-300">→</span>
                        <select
                          value={mapped ?? ""}
                          onChange={e => setColumnMap(m => ({ ...m, [col]: e.target.value }))}
                          className="text-xs border-0 bg-transparent text-indigo-600 font-medium focus:outline-none cursor-pointer"
                        >
                          <option value="">skip</option>
                          {Object.entries(config.map)
                            .map(([, v]) => v)
                            .filter((v, i, a) => a.indexOf(v) === i && !v.startsWith("_"))
                            .sort()
                            .map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview (first 3 rows)</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="text-xs w-full min-w-[400px]">
                    <thead className="bg-gray-50">
                      <tr>
                        {allCols.filter(c => columnMap[c]).map(c => (
                          <th key={c} className="text-left px-3 py-2 text-gray-500 font-medium whitespace-nowrap">{columnMap[c]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {preview.map((row, i) => (
                        <tr key={i}>
                          {allCols.filter(c => columnMap[c]).map(c => (
                            <td key={c} className="px-3 py-2 text-gray-700 max-w-[160px] truncate" title={row[c]}>{row[c]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={runImport} disabled={importing || mappedCount === 0}>
                  {importing ? "Importing…" : `Import ${rows.length} ${TYPE_CONFIG[activeType].label}`}
                </Button>
                <Button variant="secondary" onClick={reset}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`rounded-xl p-5 ${result.errors.length === 0 ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
              <div className="flex items-center gap-2 mb-3">
                {result.errors.length === 0
                  ? <CheckCircle size={20} className="text-green-600" />
                  : <AlertCircle size={20} className="text-yellow-600" />}
                <p className="font-semibold text-gray-800">Import complete</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Imported</p>
                  <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Skipped</p>
                  <p className="text-2xl font-bold text-gray-400">{result.skipped}</p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-600 mb-1">Errors ({result.errors.length})</p>
                  <div className="bg-white rounded border border-yellow-200 p-2 max-h-28 overflow-y-auto">
                    {result.errors.slice(0, 10).map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
                  </div>
                </div>
              )}
              <Button onClick={reset}>Import another file</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

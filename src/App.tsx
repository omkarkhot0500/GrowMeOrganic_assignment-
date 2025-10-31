
import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import type { Artwork } from './types';

interface ApiResponse {
  data: Artwork[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
  };
}

const PAGE_SIZE = 12;

const App: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<{ [id: number]: boolean }>(() => {
    const saved = localStorage.getItem('selectedIds');
    return saved ? JSON.parse(saved) : {};
  });
  const [selectCount, setSelectCount] = useState<number | undefined>(undefined);
  const overlayRef = React.useRef<any>(null);

  useEffect(() => {
    fetchData(page);
  }, [page]);

  useEffect(() => {
    localStorage.setItem('selectedIds', JSON.stringify(selectedIds));
  }, [selectedIds]);

  const fetchData = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${pageNum}`);
      const json: ApiResponse = await res.json();
      setArtworks(json.data);
      setTotalRecords(json.pagination.total);
    } catch (e) {
      setArtworks([]);
    }
    setLoading(false);
  };

  const onSelectAll = (checked: boolean) => {
    const newSelected = { ...selectedIds };
    artworks.forEach((art) => {
      newSelected[art.id] = checked;
    });
    setSelectedIds(newSelected);
  };

const onCustomSelect = async () => {
  if (!selectCount || selectCount < 1) return;
  const newSelected = { ...selectedIds };
  const limit = Math.min(selectCount, 100);
  const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=1&limit=${limit}`);
  const json: ApiResponse = await res.json();

  let count = 0;
  for (let i = 0; i < json.data.length && count < selectCount; i++) {
    const id = json.data[i].id;
    if (!newSelected[id]) {
      newSelected[id] = true;
      count++;
    }
  }

  setSelectedIds(newSelected);
  if (overlayRef.current) overlayRef.current.hide();
};

  const isRowSelected = (id: number) => !!selectedIds[id];
  const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  return (
  <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, minHeight: '100vh', overflow: 'hidden' }}>
      <h2>Artworks Table</h2>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
  <Checkbox checked={artworks.every((a) => isRowSelected(a.id)) && artworks.length > 0} onChange={e => onSelectAll(!!e.checked)} />
        <span>Select All</span>
  <Button icon="pi pi-chevron-down" onClick={e => overlayRef.current.toggle(e)} aria-haspopup aria-controls="overlay_panel" style={{ marginLeft: 8, background: '#1e3a8a', borderColor: '#1e3a8a', color: '#fff' }} />
        <OverlayPanel ref={overlayRef} id="overlay_panel" showCloseIcon dismissable>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span>Select rows...</span>
            <InputNumber value={selectCount ?? null} onValueChange={e => setSelectCount(e.value === null ? undefined : e.value)} min={1} max={totalRecords} placeholder="Select rows..." />
            <Button label="submit" onClick={onCustomSelect} className="p-button-primary" style={{ background: '#2563eb', borderColor: '#2563eb' }} />
          </div>
        </OverlayPanel>
        <span style={{ marginLeft: 16 }}>Selected: {selectedCount}</span>
      </div>
      <DataTable
        value={artworks}
        loading={loading}
        paginator
        rows={PAGE_SIZE}
        totalRecords={totalRecords}
        first={(page - 1) * PAGE_SIZE}
        onPage={(e) => {
          setPage((e.page ?? 0) + 1);
        }}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        pageLinkSize={5}
        lazy
        selection={artworks.filter(a => isRowSelected(a.id))}
        selectionMode="checkbox"
        onSelectionChange={e => {
          const selected = e.value as Artwork[];
          const newSelected: { [id: number]: boolean } = { ...selectedIds };
          artworks.forEach(a => {
            newSelected[a.id] = !!selected.find(s => s.id === a.id);
          });
          setSelectedIds(newSelected);
        }}
        dataKey="id"
        scrollable={false}
        style={{ width: '100%', tableLayout: 'fixed' }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
  <Column field="title" header="Title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 250 }} />
  <Column field="place_of_origin" header="Place of Origin" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }} />
  <Column field="artist_display" header="Artist" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 250 }} />
  <Column field="inscriptions" header="Inscriptions" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }} />
  <Column field="date_start" header="Date Start" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }} />
  <Column field="date_end" header="Date End" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }} />
      </DataTable>
    </div>
  );
};

export default App;

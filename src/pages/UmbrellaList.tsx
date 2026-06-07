import { useEffect, useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { useUmbrellaStore } from '../store/umbrellaStore';
import UmbrellaCard from '../components/UmbrellaCard';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import Modal from '../components/Modal';
import { umbrellaApi } from '../services/api';
import { getCurrentDate } from '../utils/date';

export default function UmbrellaList() {
  const { umbrellas, loading, error, fetchUmbrellas, clearError } = useUmbrellaStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUmbrella, setNewUmbrella] = useState({
    umbrellaNo: '',
    plannedIntervalDays: 5,
  });
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchUmbrellas(statusFilter !== 'all' ? statusFilter : undefined, searchQuery || undefined);
  }, [fetchUmbrellas, statusFilter, searchQuery]);

  const handleAddUmbrella = async () => {
    try {
      setAddError('');
      if (!newUmbrella.umbrellaNo.trim()) {
        setAddError('请输入伞号');
        return;
      }
      if (!newUmbrella.plannedIntervalDays || newUmbrella.plannedIntervalDays < 1) {
        setAddError('请输入有效的计划间隔天数');
        return;
      }
      await umbrellaApi.createUmbrella(newUmbrella);
      setShowAddModal(false);
      setNewUmbrella({ umbrellaNo: '', plannedIntervalDays: 5 });
      fetchUmbrellas(statusFilter !== 'all' ? statusFilter : undefined, searchQuery || undefined);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : '创建失败');
    }
  };

  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: 'normal', label: '正常' },
    { value: 'stagnant', label: '裱糊停滞' },
    { value: 'completed', label: '已完工' },
  ];

  const stats = {
    total: umbrellas.length,
    normal: umbrellas.filter((u) => u.status === 'normal').length,
    stagnant: umbrellas.filter((u) => u.status === 'stagnant').length,
    completed: umbrellas.filter((u) => u.status === 'completed').length,
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-700 font-serif mb-2">伞号列表</h2>
        <p className="text-ink-600 text-sm">管理所有油纸伞的裱糊进度与质量状态</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: '总数', value: stats.total, color: 'ink' },
          { label: '正常', value: stats.normal, color: 'bamboo' },
          { label: '停滞', value: stats.stagnant, color: 'cinnabar' },
          { label: '已完工', value: stats.completed, color: 'ink' },
        ].map((item) => (
          <div key={item.label} className="card p-4 animate-fade-in-up">
            <p className="text-xs text-ink-600 mb-1">{item.label}</p>
            <p
              className={`text-2xl font-bold font-serif ${
                item.color === 'cinnabar'
                  ? 'text-cinnabar-600'
                  : item.color === 'bamboo'
                  ? 'text-bamboo-600'
                  : 'text-ink-700'
              }`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-600" />
          <input
            type="text"
            placeholder="搜索伞号..."
            className="input-field pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-ink-600" />
          <select
            className="input-field w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button className="btn-primary whitespace-nowrap" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 inline mr-1" />
            新增伞号
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={clearError} />}

      {loading ? (
        <Loading />
      ) : umbrellas.length === 0 ? (
        <div className="text-center py-16 text-ink-600">
          <p className="text-lg mb-2">暂无伞号数据</p>
          <p className="text-sm opacity-70">点击右上角按钮新增伞号</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {umbrellas.map((umbrella, index) => (
            <UmbrellaCard key={umbrella.id} umbrella={umbrella} index={index} />
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddError('');
          setNewUmbrella({ umbrellaNo: '', plannedIntervalDays: 5 });
        }}
        title="新增伞号"
      >
        {addError && <ErrorAlert message={addError} onClose={() => setAddError('')} />}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">伞号</label>
            <input
              type="text"
              className="input-field"
              placeholder="例如：YS-2026-007"
              value={newUmbrella.umbrellaNo}
              onChange={(e) => setNewUmbrella({ ...newUmbrella, umbrellaNo: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">
              计划裱糊间隔天数
            </label>
            <input
              type="number"
              className="input-field"
              min="1"
              value={newUmbrella.plannedIntervalDays}
              onChange={(e) =>
                setNewUmbrella({
                  ...newUmbrella,
                  plannedIntervalDays: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="btn-outline flex-1"
              onClick={() => setShowAddModal(false)}
            >
              取消
            </button>
            <button type="button" className="btn-primary flex-1" onClick={handleAddUmbrella}>
              确认创建
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

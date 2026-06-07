import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Calendar, Ruler, Eye } from 'lucide-react';
import { useUmbrellaStore } from '../store/umbrellaStore';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import Modal from '../components/Modal';
import { umbrellaApi } from '../services/api';
import { formatDate, getStatusClass, getCurrentDate } from '../utils/date';
import type { UmbrellaListItem } from '@shared/types';

export default function CompletionPage() {
  const navigate = useNavigate();
  const { umbrellas, loading, error, fetchUmbrellas, clearError } = useUmbrellaStore();
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedUmbrella, setSelectedUmbrella] = useState<UmbrellaListItem | null>(null);
  const [completeData, setCompleteData] = useState({
    completedDate: getCurrentDate(),
    note: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUmbrellas();
  }, [fetchUmbrellas]);

  const completableUmbrellas = umbrellas.filter(
    (u) => u.status !== 'completed' && u.status !== 'stagnant',
  );

  const completedUmbrellas = umbrellas.filter((u) => u.status === 'completed');
  const stagnantUmbrellas = umbrellas.filter((u) => u.status === 'stagnant');

  const handleComplete = async () => {
    try {
      setSubmitError('');
      if (!completeData.completedDate) {
        setSubmitError('请选择完工日期');
        return;
      }
      if (!selectedUmbrella) return;

      await umbrellaApi.completeUmbrella(selectedUmbrella.id, {
        completedDate: completeData.completedDate,
        note: completeData.note,
      });

      setShowCompleteModal(false);
      setSelectedUmbrella(null);
      setCompleteData({ completedDate: getCurrentDate(), note: '' });
      fetchUmbrellas();
      setSuccessMessage(`${selectedUmbrella.umbrellaNo} 完工登记成功`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '登记失败');
    }
  };

  const openCompleteModal = (umbrella: UmbrellaListItem) => {
    setSelectedUmbrella(umbrella);
    setCompleteData({ completedDate: getCurrentDate(), note: '' });
    setSubmitError('');
    setShowCompleteModal(true);
  };

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-700 font-serif mb-2">完工登记</h2>
        <p className="text-ink-600 text-sm">对完成所有裱糊工序且状态正常的伞进行完工交付登记</p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-bamboo-50 border border-bamboo-200 rounded-lg text-bamboo-700 animate-fade-in">
          <CheckCircle className="w-4 h-4 inline mr-2" />
          {successMessage}
        </div>
      )}

      {stagnantUmbrellas.length > 0 && (
        <div className="mb-6 p-4 bg-cinnabar-50 border border-cinnabar-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-cinnabar-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-cinnabar-700 mb-1">
                ⚠️ 有 {stagnantUmbrellas.length} 把伞处于停滞状态，无法登记完工
              </p>
              <p className="text-sm text-cinnabar-600">
                请先前往「停滞待处理」页面解除停滞后再进行操作
              </p>
            </div>
          </div>
        </div>
      )}

      {error && <ErrorAlert message={error} onClose={clearError} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 animate-fade-in-up animation-delay-0">
          <p className="text-xs text-ink-600 mb-1">可完工</p>
          <p className="text-3xl font-bold text-bamboo-600 font-serif">
            {completableUmbrellas.length}
          </p>
        </div>
        <div className="card p-5 animate-fade-in-up animation-delay-80">
          <p className="text-xs text-ink-600 mb-1">停滞中</p>
          <p className="text-3xl font-bold text-cinnabar-600 font-serif">
            {stagnantUmbrellas.length}
          </p>
        </div>
        <div className="card p-5 animate-fade-in-up animation-delay-160">
          <p className="text-xs text-ink-600 mb-1">已完工</p>
          <p className="text-3xl font-bold text-ink-600 font-serif">{completedUmbrellas.length}</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-ink-700 font-serif mb-4">待完工伞号</h3>
        {completableUmbrellas.length === 0 ? (
          <div className="card p-8 text-center text-ink-600">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-bamboo-600 opacity-50" />
            <p className="mb-2">暂无待完工的伞号</p>
            <p className="text-sm opacity-70">所有可完工的伞都已完成登记</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completableUmbrellas.map((umbrella, index) => (
              <div
                key={umbrella.id}
                className={`card p-5 animate-fade-in-up animation-delay-${(index % 6) * 80}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-ink-700 font-serif">
                        {umbrella.umbrellaNo}
                      </h4>
                      <span className={getStatusClass(umbrella.status)}>正常</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-ink-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gold-500" />
                        <span>计划间隔：{umbrella.plannedIntervalDays} 天</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-bamboo-600" />
                        <span>已裱糊：{umbrella.pastingCount} 次</span>
                      </div>
                      {umbrella.lastPastingDate && (
                        <div className="text-xs opacity-80">
                          最近裱糊：{formatDate(umbrella.lastPastingDate)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn-outline text-sm"
                      onClick={() => navigate(`/umbrella/${umbrella.id}`)}
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      查看
                    </button>
                    <button
                      className="btn-primary text-sm"
                      onClick={() => openCompleteModal(umbrella)}
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      完工登记
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completedUmbrellas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-ink-700 font-serif mb-4">已完工记录</h3>
          <div className="space-y-3">
            {completedUmbrellas.map((umbrella, index) => (
              <div
                key={umbrella.id}
                className={`card p-4 opacity-80 animate-fade-in-up animation-delay-${(index % 6) * 80}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-bamboo-600" />
                    <div>
                      <h4 className="font-medium text-ink-700">{umbrella.umbrellaNo}</h4>
                      <p className="text-xs text-ink-600">
                        裱糊 {umbrella.pastingCount} 次 · 完工于{' '}
                        {umbrella.completedAt && formatDate(umbrella.completedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn-outline text-sm"
                    onClick={() => navigate(`/umbrella/${umbrella.id}`)}
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    查看详情
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setSelectedUmbrella(null);
          setSubmitError('');
          setCompleteData({ completedDate: getCurrentDate(), note: '' });
        }}
        title="完工登记"
      >
        {submitError && <ErrorAlert message={submitError} onClose={() => setSubmitError('')} />}
        {selectedUmbrella && (
          <div className="space-y-4">
            <div className="p-3 bg-paper-100 rounded-lg">
              <p className="text-sm font-medium text-ink-700 mb-1">
                伞号：{selectedUmbrella.umbrellaNo}
              </p>
              <p className="text-xs text-ink-600">
                已完成裱糊 {selectedUmbrella.pastingCount} 次
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">完工日期</label>
              <input
                type="date"
                className="input-field"
                value={completeData.completedDate}
                onChange={(e) => setCompleteData({ ...completeData, completedDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                验收备注 (可选)
              </label>
              <textarea
                className="input-field min-h-[80px]"
                placeholder="填写质量验收、客户信息等备注..."
                value={completeData.note}
                onChange={(e) => setCompleteData({ ...completeData, note: e.target.value })}
              />
            </div>
            <div className="p-3 bg-bamboo-50 border border-bamboo-100 rounded-lg text-xs text-bamboo-700">
              <p>✅ 确认该伞已完成所有裱糊工序，质量验收合格。</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="btn-outline flex-1"
                onClick={() => setShowCompleteModal(false)}
              >
                取消
              </button>
              <button type="button" className="btn-primary flex-1" onClick={handleComplete}>
                确认完工
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

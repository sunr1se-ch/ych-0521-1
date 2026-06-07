import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Calendar, Eye, CheckCircle, Clock } from 'lucide-react';
import { useUmbrellaStore } from '../store/umbrellaStore';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import Modal from '../components/Modal';
import { stagnationApi } from '../services/api';
import { formatDate, daysBetween, getCurrentDate } from '../utils/date';
import type { StagnationWithUmbrella } from '@shared/types';

export default function StagnationList() {
  const navigate = useNavigate();
  const { stagnations, loading, error, fetchStagnations, clearError } = useUmbrellaStore();
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedStagnation, setSelectedStagnation] = useState<StagnationWithUmbrella | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [filterResolved, setFilterResolved] = useState<boolean | undefined>(false);

  useEffect(() => {
    fetchStagnations(filterResolved);
  }, [fetchStagnations, filterResolved]);

  const handleResolve = async () => {
    try {
      setSubmitError('');
      if (!resolutionNote.trim()) {
        setSubmitError('请填写处理说明');
        return;
      }
      if (!selectedStagnation) return;

      await stagnationApi.resolveStagnation(selectedStagnation.id, {
        resolutionNote: resolutionNote.trim(),
      });

      setShowResolveModal(false);
      setSelectedStagnation(null);
      setResolutionNote('');
      fetchStagnations(filterResolved);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '解除失败');
    }
  };

  const openResolveModal = (stagnation: StagnationWithUmbrella) => {
    setSelectedStagnation(stagnation);
    setResolutionNote('');
    setSubmitError('');
    setShowResolveModal(true);
  };

  const unresolvedCount = stagnations.filter((s) => !s.resolved).length;

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-700 font-serif mb-2">停滞待处理</h2>
        <p className="text-ink-600 text-sm">
          处理因裱糊间隔超时和起皱超标导致的停滞记录
        </p>
      </div>

      {unresolvedCount > 0 && (
        <div className="mb-6 p-4 bg-cinnabar-50 border border-cinnabar-200 rounded-lg animate-pulse-red">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-cinnabar-600" />
            <div>
              <p className="font-medium text-cinnabar-700">
                当前有 <span className="text-xl">{unresolvedCount}</span> 把伞处于裱糊停滞状态
              </p>
              <p className="text-sm text-cinnabar-600">请及时处理，停滞未解除前不得登记完工</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <button
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterResolved === false
              ? 'bg-cinnabar-600 text-white'
              : 'bg-paper-200 text-ink-600 hover:bg-paper-300'
          }`}
          onClick={() => setFilterResolved(false)}
        >
          待处理
        </button>
        <button
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterResolved === true
              ? 'bg-bamboo-600 text-white'
              : 'bg-paper-200 text-ink-600 hover:bg-paper-300'
          }`}
          onClick={() => setFilterResolved(true)}
        >
          已处理
        </button>
        <button
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterResolved === undefined
              ? 'bg-ink-600 text-white'
              : 'bg-paper-200 text-ink-600 hover:bg-paper-300'
          }`}
          onClick={() => setFilterResolved(undefined)}
        >
          全部
        </button>
      </div>

      {error && <ErrorAlert message={error} onClose={clearError} />}

      {stagnations.length === 0 ? (
        <div className="text-center py-16 text-ink-600">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-bamboo-600 opacity-50" />
          <p className="text-lg mb-2">
            {filterResolved === false ? '暂无待处理的停滞记录' : '暂无停滞记录'}
          </p>
          <p className="text-sm opacity-70">
            {filterResolved === false ? '所有伞号裱糊进度正常' : '保持良好的裱糊节奏'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {stagnations.map((stagnation, index) => {
            const stagnantDays = daysBetween(stagnation.stagnantDate, getCurrentDate());
            return (
              <div
                key={stagnation.id}
                className={`card p-5 animate-fade-in-up animation-delay-${(index % 6) * 80} ${
                  !stagnation.resolved ? 'border-cinnabar-200 border-2' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-ink-700 font-serif">
                        {stagnation.umbrella.umbrellaNo}
                      </h3>
                      <span
                        className={`status-badge ${
                          stagnation.resolved
                            ? 'bg-bamboo-100 text-bamboo-700'
                            : 'bg-cinnabar-100 text-cinnabar-600'
                        }`}
                      >
                        {stagnation.resolved ? '已解除' : '待处理'}
                      </span>
                      {!stagnation.resolved && (
                        <div className="flex items-center gap-1 text-sm text-cinnabar-600">
                          <Clock className="w-4 h-4" />
                          <span>已停滞 {stagnantDays} 天</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2 text-ink-600">
                        <AlertTriangle className="w-4 h-4 text-cinnabar-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-ink-700">停滞原因</p>
                          <p className="mt-0.5">{stagnation.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-ink-600 opacity-80">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>停滞日期：{formatDate(stagnation.stagnantDate)}</span>
                        </div>
                        {stagnation.resolvedAt && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-bamboo-600" />
                            <span>解除日期：{formatDate(stagnation.resolvedAt)}</span>
                          </div>
                        )}
                      </div>
                      {stagnation.resolutionNote && (
                        <div className="p-3 bg-paper-100 rounded-lg text-xs">
                          <p className="font-medium text-ink-700 mb-1">处理说明</p>
                          <p className="text-ink-600">{stagnation.resolutionNote}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      className="btn-outline text-sm"
                      onClick={() => navigate(`/umbrella/${stagnation.umbrellaId}`)}
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      查看详情
                    </button>
                    {!stagnation.resolved && (
                      <button
                        className="btn-secondary text-sm"
                        onClick={() => openResolveModal(stagnation)}
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        解除停滞
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showResolveModal}
        onClose={() => {
          setShowResolveModal(false);
          setSelectedStagnation(null);
          setSubmitError('');
          setResolutionNote('');
        }}
        title="解除裱糊停滞"
      >
        {submitError && <ErrorAlert message={submitError} onClose={() => setSubmitError('')} />}
        {selectedStagnation && (
          <div className="space-y-4">
            <div className="p-3 bg-paper-100 rounded-lg">
              <p className="text-sm font-medium text-ink-700 mb-1">
                伞号：{selectedStagnation.umbrella.umbrellaNo}
              </p>
              <p className="text-xs text-ink-600">
                停滞原因：{selectedStagnation.reason}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">处理说明</label>
              <textarea
                className="input-field min-h-[100px]"
                placeholder="请说明采取的处理措施，例如：重新裱糊、调整工艺参数等..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
              />
            </div>
            <div className="p-3 bg-cinnabar-50 border border-cinnabar-100 rounded-lg text-xs text-cinnabar-600">
              <p>⚠️ 解除停滞后，该伞将恢复正常状态，可以继续裱糊或登记完工。</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="btn-outline flex-1"
                onClick={() => setShowResolveModal(false)}
              >
                取消
              </button>
              <button type="button" className="btn-primary flex-1" onClick={handleResolve}>
                确认解除
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

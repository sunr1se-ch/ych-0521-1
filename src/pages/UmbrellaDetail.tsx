import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Ruler, AlertTriangle, CheckCircle } from 'lucide-react';
import { useUmbrellaStore } from '../store/umbrellaStore';
import Timeline from '../components/Timeline';
import WrinkleChart from '../components/WrinkleChart';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import Modal from '../components/Modal';
import { umbrellaApi } from '../services/api';
import { formatDate, getStatusText, getStatusClass, getCurrentDate } from '../utils/date';

export default function UmbrellaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { umbrellaDetail, loading, error, fetchUmbrellaDetail, clearError } = useUmbrellaStore();

  const [showPastingModal, setShowPastingModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [pastingData, setPastingData] = useState({
    pastingDate: getCurrentDate(),
    wrinkleLength: '',
  });
  const [completeData, setCompleteData] = useState({
    completedDate: getCurrentDate(),
    note: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (id) {
      fetchUmbrellaDetail(id);
    }
  }, [fetchUmbrellaDetail, id]);

  const handleAddPasting = async () => {
    try {
      setSubmitError('');
      if (!pastingData.pastingDate) {
        setSubmitError('请选择裱糊日期');
        return;
      }
      if (!pastingData.wrinkleLength || parseFloat(pastingData.wrinkleLength) < 0) {
        setSubmitError('请输入有效的起皱长度');
        return;
      }
      if (!id) return;

      const result = await umbrellaApi.addPastingRecord(id, {
        pastingDate: pastingData.pastingDate,
        wrinkleLength: parseFloat(pastingData.wrinkleLength),
      });

      setShowPastingModal(false);
      setPastingData({ pastingDate: getCurrentDate(), wrinkleLength: '' });
      fetchUmbrellaDetail(id);

      if (result.stagnation) {
        setSuccessMessage('⚠️ 裱糊记录已添加，但触发了「裱糊停滞」！');
      } else {
        setSuccessMessage('裱糊记录添加成功');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '添加失败');
    }
  };

  const handleComplete = async () => {
    try {
      setSubmitError('');
      if (!completeData.completedDate) {
        setSubmitError('请选择完工日期');
        return;
      }
      if (!id) return;

      await umbrellaApi.completeUmbrella(id, {
        completedDate: completeData.completedDate,
        note: completeData.note,
      });

      setShowCompleteModal(false);
      setCompleteData({ completedDate: getCurrentDate(), note: '' });
      fetchUmbrellaDetail(id);
      setSuccessMessage('完工登记成功');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '登记失败');
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} onClose={clearError} />;
  if (!umbrellaDetail) {
    return (
      <div className="text-center py-16 text-ink-600">
        <p className="text-lg mb-4">伞号不存在</p>
        <button className="btn-outline" onClick={() => navigate('/')}>
          返回列表
        </button>
      </div>
    );
  }

  const isCompleted = umbrellaDetail.status === 'completed';
  const isStagnant = umbrellaDetail.status === 'stagnant';

  return (
    <div className="animate-fade-in">
      <button
        className="flex items-center gap-2 text-ink-600 hover:text-ink-700 mb-6 transition-colors"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回伞号列表</span>
      </button>

      {successMessage && (
        <div className="mb-6 p-4 bg-bamboo-50 border border-bamboo-200 rounded-lg text-bamboo-700 animate-fade-in">
          {successMessage}
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink-700 font-serif mb-2">
              {umbrellaDetail.umbrellaNo}
            </h2>
            <div className={`mb-3 ${getStatusClass(umbrellaDetail.status)}`}>
              {isStagnant && <AlertTriangle className="w-3 h-3 mr-1" />}
              {isCompleted && <CheckCircle className="w-3 h-3 mr-1" />}
              {getStatusText(umbrellaDetail.status)}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-ink-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-500" />
                <span>计划间隔：{umbrellaDetail.plannedIntervalDays} 天</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-bamboo-600" />
                <span>裱糊次数：{umbrellaDetail.records.length} 次</span>
              </div>
              <div className="flex items-center gap-2 text-xs opacity-80">
                <span>创建时间：{formatDate(umbrellaDetail.createdAt)}</span>
              </div>
              {umbrellaDetail.completedAt && (
                <div className="flex items-center gap-2 text-xs opacity-80">
                  <span>完工时间：{formatDate(umbrellaDetail.completedAt)}</span>
                </div>
              )}
            </div>
          </div>
          {!isCompleted && (
            <div className="flex gap-3">
              <button
                className="btn-secondary"
                onClick={() => setShowPastingModal(true)}
                disabled={isCompleted}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                新增裱糊
              </button>
              <button
                className="btn-primary"
                onClick={() => setShowCompleteModal(true)}
                disabled={isCompleted || isStagnant}
              >
                <CheckCircle className="w-4 h-4 inline mr-1" />
                登记完工
              </button>
            </div>
          )}
        </div>

        {isStagnant && (
          <div className="mt-6 p-4 bg-cinnabar-50 border border-cinnabar-200 rounded-lg animate-pulse-red">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-cinnabar-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-cinnabar-700 mb-1">⚠️ 该伞目前处于裱糊停滞状态</p>
                {umbrellaDetail.stagnations
                  .filter((s) => !s.resolved)
                  .map((s) => (
                    <p key={s.id} className="text-sm text-cinnabar-600">
                      原因：{s.reason}
                    </p>
                  ))}
                <p className="text-xs text-cinnabar-600 mt-2 opacity-80">
                  请先前往「停滞待处理」页面解除停滞，再进行完工登记
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {umbrellaDetail.records.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-ink-700 font-serif mb-4">起皱趋势图</h3>
          <WrinkleChart records={umbrellaDetail.records} />
        </div>
      )}

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-ink-700 font-serif mb-6">裱糊时间线</h3>
        <Timeline records={umbrellaDetail.records} />
      </div>

      <Modal
        isOpen={showPastingModal}
        onClose={() => {
          setShowPastingModal(false);
          setSubmitError('');
          setPastingData({ pastingDate: getCurrentDate(), wrinkleLength: '' });
        }}
        title="新增裱糊记录"
      >
        {submitError && <ErrorAlert message={submitError} onClose={() => setSubmitError('')} />}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">裱糊日期</label>
            <input
              type="date"
              className="input-field"
              value={pastingData.pastingDate}
              onChange={(e) => setPastingData({ ...pastingData, pastingDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">
              起皱长度 (厘米)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              className="input-field"
              placeholder="例如：1.5"
              value={pastingData.wrinkleLength}
              onChange={(e) => setPastingData({ ...pastingData, wrinkleLength: e.target.value })}
            />
            <p className="text-xs text-ink-600 mt-1 opacity-70">
              测量伞面起皱的总长度，精确到 0.1 厘米
            </p>
          </div>
          <div className="p-3 bg-paper-100 rounded-lg text-xs text-ink-600">
            <p className="font-medium mb-1">📋 停滞判定规则</p>
            <p>
              若实际间隔比计划多出 <span className="text-cinnabar-600 font-medium">2 天</span> 及以上，
              且本次起皱较上次增加 <span className="text-cinnabar-600 font-medium">3 厘米</span> 及以上，
              则标记为「裱糊停滞」
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="btn-outline flex-1"
              onClick={() => setShowPastingModal(false)}
            >
              取消
            </button>
            <button type="button" className="btn-primary flex-1" onClick={handleAddPasting}>
              确认添加
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setSubmitError('');
          setCompleteData({ completedDate: getCurrentDate(), note: '' });
        }}
        title="完工登记"
      >
        {submitError && <ErrorAlert message={submitError} onClose={() => setSubmitError('')} />}
        <div className="space-y-4">
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
            <label className="block text-sm font-medium text-ink-700 mb-1.5">备注 (可选)</label>
            <textarea
              className="input-field min-h-[80px]"
              placeholder="填写完工验收备注..."
              value={completeData.note}
              onChange={(e) => setCompleteData({ ...completeData, note: e.target.value })}
            />
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
      </Modal>
    </div>
  );
}

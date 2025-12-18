/**
 * 自定义 Span 创建工具
 * 用于手动创建遥测数据，支持关键业务指标监控
 */

import { trace, SpanStatusCode, context } from '@opentelemetry/api';

const tracer = trace.getTracer('retro-camera-custom');

/**
 * 创建拍照操作的 Span
 * @param {Function} operation - 要执行的操作
 * @param {Object} attributes - 额外属性
 */
export async function tracePhotoCapture(operation, attributes = {}) {
  return tracer.startActiveSpan('photo.capture', async (span) => {
    try {
      span.setAttributes({
        'photo.operation': 'capture',
        'photo.timestamp': Date.now(),
        ...attributes,
      });

      const result = await operation();

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * 创建 AI 生成字幕的 Span
 * @param {Function} operation - 要执行的操作
 * @param {Object} attributes - 额外属性
 */
export async function traceAICaption(operation, attributes = {}) {
  return tracer.startActiveSpan('ai.caption.generate', async (span) => {
    const startTime = Date.now();

    try {
      span.setAttributes({
        'ai.provider': 'gemini',
        'ai.operation': 'caption_generation',
        ...attributes,
      });

      const result = await operation();

      span.setAttributes({
        'ai.duration_ms': Date.now() - startTime,
        'ai.success': true,
      });
      span.setStatus({ code: SpanStatusCode.OK });

      return result;
    } catch (error) {
      span.setAttributes({
        'ai.duration_ms': Date.now() - startTime,
        'ai.success': false,
        'ai.error': error.message,
      });
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * 创建用户交互 Span
 * @param {string} action - 操作名称
 * @param {Function} operation - 要执行的操作
 * @param {Object} attributes - 额外属性
 */
export async function traceUserInteraction(action, operation, attributes = {}) {
  return tracer.startActiveSpan(`user.interaction.${action}`, async (span) => {
    try {
      span.setAttributes({
        'user.action': action,
        'user.timestamp': Date.now(),
        ...attributes,
      });

      const result = await operation();

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * 记录错误事件（用于报警）
 * @param {string} errorType - 错误类型
 * @param {Error} error - 错误对象
 * @param {Object} attributes - 额外属性
 */
export function recordError(errorType, error, attributes = {}) {
  const span = trace.getActiveSpan();
  if (span) {
    span.recordException(error);
    span.setAttributes({
      'error.type': errorType,
      'error.message': error.message,
      'error.stack': error.stack,
      ...attributes,
    });
  }
}

/**
 * 记录业务指标事件
 * @param {string} metricName - 指标名称
 * @param {number} value - 指标值
 * @param {Object} attributes - 额外属性
 */
export function recordMetric(metricName, value, attributes = {}) {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(metricName, {
      'metric.value': value,
      'metric.timestamp': Date.now(),
      ...attributes,
    });
  }
}

export default {
  tracePhotoCapture,
  traceAICaption,
  traceUserInteraction,
  recordError,
  recordMetric,
};

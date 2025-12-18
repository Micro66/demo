/**
 * OpenTelemetry 配置文件
 * 用于前端浏览器端的遥测数据收集和导出
 */

import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// OpenTelemetry Collector 端点配置
const OTEL_COLLECTOR_URL = import.meta.env.VITE_OTEL_COLLECTOR_URL || 'http://localhost:4318/v1/traces';

/**
 * 初始化 OpenTelemetry
 * @param {Object} config - 配置选项
 * @param {string} config.serviceName - 服务名称
 * @param {string} config.serviceVersion - 服务版本
 * @param {string} config.environment - 环境 (production/staging/development)
 */
export function initOpenTelemetry(config = {}) {
  const {
    serviceName = 'retro-camera-web-app',
    serviceVersion = '1.0.0',
    environment = 'development'
  } = config;

  // 创建资源信息
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
  });

  // 创建 OTLP 导出器 - 数据会发送到 Collector，由 Collector 转发到 ES
  const traceExporter = new OTLPTraceExporter({
    url: OTEL_COLLECTOR_URL,
    headers: {
      // 可以添加认证头
      // 'Authorization': 'Bearer <token>'
    },
  });

  // 创建 Tracer Provider
  const provider = new WebTracerProvider({
    resource: resource,
  });

  // 添加批量 Span 处理器
  provider.addSpanProcessor(new BatchSpanProcessor(traceExporter, {
    maxQueueSize: 100,
    maxExportBatchSize: 10,
    scheduledDelayMillis: 500,
    exportTimeoutMillis: 30000,
  }));

  // 注册 Provider
  provider.register({
    contextManager: new ZoneContextManager(),
  });

  // 注册自动检测
  registerInstrumentations({
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: [/.*/],
          clearTimingResources: true,
        },
        '@opentelemetry/instrumentation-xml-http-request': {
          propagateTraceHeaderCorsUrls: [/.*/],
        },
        '@opentelemetry/instrumentation-document-load': {},
        '@opentelemetry/instrumentation-user-interaction': {
          eventNames: ['click', 'submit'],
        },
      }),
    ],
  });

  console.log('OpenTelemetry initialized successfully');
  return provider;
}

/**
 * 获取 Tracer 实例
 * @param {string} name - Tracer 名称
 */
export function getTracer(name = 'retro-camera-tracer') {
  const { trace } = require('@opentelemetry/api');
  return trace.getTracer(name);
}

export default initOpenTelemetry;

# OpenTelemetry 报警配置说明

## 架构概述

```
┌─────────────┐    ┌─────────────────┐    ┌──────────────┐
│  Web App    │───▶│  OTel Collector │───▶│ Elasticsearch│
│ (Browser)   │    │                 │    │   (存储)      │
└─────────────┘    │   ┌──────────┐  │    └──────────────┘
                   │   │spanmetrics│  │           │
                   │   └────┬─────┘  │           ▼
                   └────────┼────────┘    ┌──────────────┐
                            │             │  ES Watcher  │
                            ▼             │   (报警)      │
                   ┌─────────────┐        └──────────────┘
                   │ Prometheus  │
                   │  (metrics)  │
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │Alertmanager │
                   │   (通知)     │
                   └─────────────┘
```

## 报警方案选择

### 方案一：Elasticsearch Watcher (推荐)

如果你的数据已经在 ES 中，使用 ES Watcher 是最简单的方案：

1. **优点**：
   - 无需额外组件
   - 直接查询原始 trace 数据
   - 配置简单

2. **配置步骤**：
   ```bash
   # 创建 Watcher
   curl -X PUT "localhost:9200/_watcher/watch/high_error_rate" \
     -H 'Content-Type: application/json' \
     -d @elasticsearch-watcher.json
   ```

### 方案二：Prometheus + Alertmanager

适合已有 Prometheus 监控体系的场景：

1. **优点**：
   - 强大的查询语言 PromQL
   - 丰富的报警规则
   - 与 Grafana 集成良好

2. **配置步骤**：
   ```bash
   # 启动 Prometheus
   prometheus --config.file=prometheus.yml \
     --storage.tsdb.path=/data/prometheus

   # 启动 Alertmanager
   alertmanager --config.file=alertmanager-config.yaml
   ```

## 报警规则说明

| 报警名称 | 触发条件 | 严重级别 |
|---------|---------|---------|
| HighErrorRate | 错误率 > 5% | Critical |
| HighLatency | P95 延迟 > 2s | Warning |
| AIServiceFailure | AI调用失败率 > 10% | Critical |
| SlowPageLoad | P90 页面加载 > 3s | Warning |
| OtelCollectorDown | Collector 不可用 | Critical |

## 快速开始

### 1. 部署 OpenTelemetry Collector

```bash
docker run -d --name otel-collector \
  -p 4317:4317 -p 4318:4318 -p 8889:8889 \
  -v $(pwd)/otel-collector-config.yaml:/etc/otel/config.yaml \
  -e ELASTICSEARCH_URL=http://your-es:9200 \
  otel/opentelemetry-collector-contrib:latest \
  --config=/etc/otel/config.yaml
```

### 2. 配置 ES Watcher

```bash
# 启用 Watcher 功能（X-Pack）
curl -X PUT "localhost:9200/_watcher/watch/high_error_rate" \
  -H 'Content-Type: application/json' \
  -d @elasticsearch-watcher.json
```

### 3. 配置 Slack Webhook

1. 创建 Slack App: https://api.slack.com/apps
2. 添加 Incoming Webhook
3. 设置环境变量:
   ```bash
   export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
   ```

## 自定义报警

### 添加新的 ES Watcher 报警

```json
{
  "trigger": {
    "schedule": { "interval": "5m" }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["otel-traces-*"],
        "body": {
          "query": { "your_query": {} }
        }
      }
    }
  },
  "condition": {
    "compare": { "ctx.payload.hits.total.value": { "gt": 100 } }
  },
  "actions": {
    "notify": { "webhook": { ... } }
  }
}
```

### 添加新的 Prometheus 报警规则

```yaml
- alert: CustomAlert
  expr: your_metric_query > threshold
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "自定义报警"
    description: "描述信息"
```

## 常见问题

**Q: 数据在 ES 中，但报警不触发？**
A: 检查 ES Watcher 是否启用，以及索引名是否正确。

**Q: 如何调整报警阈值？**
A: 修改对应配置文件中的阈值参数，然后重新加载配置。

**Q: 支持哪些通知渠道？**
A: Slack、Email、PagerDuty、Webhook、企业微信、钉钉等。

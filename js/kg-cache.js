// 知识图谱缓存管理

const KGCache = {
    // 缓存数据结构
    cache: {
        allNodes: [],
        allEdges: [],
        nodeMap: new Map(),
        edgeMap: new Map()
    },
    
    /**
     * 初始化缓存
     */
    init() {
        this.cache = {
            allNodes: [],
            allEdges: [],
            nodeMap: new Map(),
            edgeMap: new Map()
        };
    },
    
    /**
     * 从数据源构建缓存
     * @param {Array} sourceNodes - 源节点数据
     * @param {Array} rels - 关系数据
     */
    build(sourceNodes, rels) {
        this.init();
        
        // 构建节点缓存
        sourceNodes.forEach(node => {
            if (!node || !node.id) return;
            const labels = node.labels || [];
            const labelStr = Array.isArray(labels) ? labels.join('') : String(labels);
            let type = 'other';
            let isEventSet = false;
            // 先用ID前缀兜底识别事件集
            if (typeof node.id === 'string' && node.id.startsWith('ES')) {
                type = 'event';
                isEventSet = true;
            }
            if ((Array.isArray(labels) && labels.includes('事件集')) || labelStr.includes('事件集')) {
                // 事件集也归为事件类型，便于初始视图显示
                type = 'event';
                isEventSet = true;
            } else if (labels.includes && labels.includes('事件')) type = 'event';
            else if (labels.includes && labels.includes('人物')) type = 'person';
            else if (labels.includes && labels.includes('地点')) type = 'location';
            else if (labels.includes && labels.includes('时间')) type = 'time';
            
            const cyNode = {
                data: { 
                    id: node.id, 
                    label: (node.properties && (node.properties.名称 || node.properties.姓名 || node.properties.name)) || node.id, 
                    type,
                    isEventSet,
                    originalNode: node
                }
            };
            this.cache.allNodes.push(cyNode);
            this.cache.nodeMap.set(node.id, cyNode);
        });
        
        // 构建边缓存
        rels.forEach(rel => {
            if (!rel.start || !rel.end) return;
            const cyEdge = {
                data: {
                    id: rel.id || `${rel.start}-${rel.type || 'REL'}-${rel.end}`,
                    source: rel.start,
                    target: rel.end,
                    label: rel.type || '',
                    originalRel: rel
                }
            };
            this.cache.allEdges.push(cyEdge);
            const key = `${rel.start}-${rel.end}`;
            if (!this.cache.edgeMap.has(key)) this.cache.edgeMap.set(key, []);
            this.cache.edgeMap.get(key).push(cyEdge);
        });
        
        console.log('知识图谱缓存构建完成:', {
            allNodes: this.cache.allNodes.length,
            allEdges: this.cache.allEdges.length,
            eventNodes: this.cache.allNodes.filter(n => n.data.type === 'event').length,
            eventSets: this.cache.allNodes.filter(n => n.data.isEventSet).length
        });
    },
    
    /**
     * 获取所有节点
     * @returns {Array}
     */
    getAllNodes() {
        return this.cache.allNodes;
    },
    
    /**
     * 获取所有边
     * @returns {Array}
     */
    getAllEdges() {
        return this.cache.allEdges;
    },
    
    /**
     * 获取节点映射
     * @returns {Map}
     */
    getNodeMap() {
        return this.cache.nodeMap;
    },
    
    /**
     * 获取边映射
     * @returns {Map}
     */
    getEdgeMap() {
        return this.cache.edgeMap;
    },
    
    /**
     * 根据ID获取节点
     * @param {string} nodeId - 节点ID
     * @returns {Object|null}
     */
    getNode(nodeId) {
        return this.cache.nodeMap.get(nodeId) || null;
    }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KGCache;
} else {
    window.KGCache = KGCache;
}




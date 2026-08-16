// Sprint M7.1 — Knowledge Graph Module Re-exports

export * from './Entities/GraphNodes';
export * from './GraphEngine/GraphEngine';
export * from './GraphBuilder/GraphBuilder';
export * from './GraphQueryEngine/GraphQueryEngine';
export * from './LinkResolver/LinkResolver';

// Re-export key classes for convenience
import { GraphEngine } from './GraphEngine/GraphEngine';
import { GraphBuilder } from './GraphBuilder/GraphBuilder';
import { GraphQueryEngine } from './GraphQueryEngine/GraphQueryEngine';
import { LinkResolver } from './LinkResolver/LinkResolver';
import {
  GraphNode,
  GraphEdge,
  NodeType,
  EdgeRelation,
  MediaNode,
  CategoryNode,
  SpeakerNode,
  TagNode,
  LanguageNode,
  AuthorNode,
  EventNode,
  PlaylistNode,
  UserNode,
  GraphPath,
  GraphQueryOptions,
  GraphTraversalOptions,
} from './Entities/GraphNodes';

export {
  GraphEngine,
  GraphBuilder,
  GraphQueryEngine,
  LinkResolver,
  GraphNode,
  GraphEdge,
  NodeType,
  EdgeRelation,
  MediaNode,
  CategoryNode,
  SpeakerNode,
  TagNode,
  LanguageNode,
  AuthorNode,
  EventNode,
  PlaylistNode,
  UserNode,
  GraphPath,
  GraphQueryOptions,
  GraphTraversalOptions,
};

// Factory function for easy initialization
export function createKnowledgeGraph(config?: {
  graphEngineConfig?: ConstructorParameters<typeof GraphEngine>[0];
  linkResolverOptions?: ConstructorParameters<typeof LinkResolver>[2];
}) {
  const graphEngine = new GraphEngine(config?.graphEngineConfig);
  const graphBuilder = new GraphBuilder(graphEngine);
  const graphQueryEngine = new GraphQueryEngine(graphEngine);
  const linkResolver = new LinkResolver(graphEngine, graphQueryEngine, config?.linkResolverOptions);

  return {
    graphEngine,
    graphBuilder,
    graphQueryEngine,
    linkResolver,
  };
}

export type KnowledgeGraphModule = ReturnType<typeof createKnowledgeGraph>;
import * as recast from "recast";

import { SplootNode, ParentReference } from "../node";
import { ChildSetType } from "../childset";
import { NodeCategory, registerNodeCateogry, EmptySuggestionGenerator, SuggestionGenerator } from "../node_category_registry";
import { TypeRegistration, NodeLayout, LayoutComponentType, LayoutComponent, registerType } from "../type_registry";
import { SuggestedNode } from "../suggested_node";
import { SplootExpression } from "./expression";
import { ASTNode } from "ast-types";
import { ExpressionKind } from "ast-types/gen/kinds";
import { HighlightColorCategory } from "../../layout/colors";

export const AWAIT_EXPRESSION = 'AWAIT_EXPRESSION';

class Generator implements SuggestionGenerator {

  staticSuggestions(parent: ParentReference, index: number) : SuggestedNode[] {
    let sampleNode = new AwaitExpression(null);
    let suggestedNode = new SuggestedNode(sampleNode, 'await', 'await', true, 'wait for result');
    return [suggestedNode];
  };

  dynamicSuggestions(parent: ParentReference, index: number, textInput: string) : SuggestedNode[] {
    return [];
  };

}

export class AwaitExpression extends SplootNode {
  constructor(parentReference: ParentReference) {
    super(parentReference, AWAIT_EXPRESSION);
    this.addChildSet('expression', ChildSetType.Single, NodeCategory.Expression);
    this.getChildSet('expression').addChild(new SplootExpression(null));
  }

  getExpression() {
    return this.getChildSet('expression');
  }

  generateJsAst() : ASTNode {
    let expression = this.getExpression().getChild(0).generateJsAst() as ExpressionKind;
    return recast.types.builders.awaitExpression(expression);
  }

  static register() {
    let typeRegistration = new TypeRegistration();
    typeRegistration.typeName = AWAIT_EXPRESSION;
    typeRegistration.childSets = {
      'expression': NodeCategory.Expression,
    };
    typeRegistration.layout = new NodeLayout(HighlightColorCategory.KEYWORD, [
      new LayoutComponent(LayoutComponentType.KEYWORD, 'await'),
      new LayoutComponent(LayoutComponentType.CHILD_SET_ATTACH_RIGHT, 'expression'),
    ]);
  
    registerType(typeRegistration);
    registerNodeCateogry(AWAIT_EXPRESSION, NodeCategory.ExpressionToken, new Generator());
  }
}
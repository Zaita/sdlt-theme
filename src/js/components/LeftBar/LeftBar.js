// @flow
// This is used for component selection

import React, {Component} from "react";
import LeftBarItem from "../LeftBar/LeftBarItem";
import type {SecurityComponent} from "../../types/SecurityComponent";
import ComponentSelectionUtil from "../../utils/ComponentSelectionUtil";

type Props = {
  selectedComponents: Array<SecurityComponent>,
  productAspects: Array<*>,
  selectedProductAspect: string,
  updateSelectedProductAspect: (selectedProductAspect: string) => void
};

export default class LeftBar extends Component<Props> {

  render() {
    const {
      selectedComponents,
      productAspects,
      selectedProductAspect,
      updateSelectedProductAspect
    } = {...this.props};

    return (
      <div className="LeftBar" key={selectedProductAspect}>
        {productAspects && productAspects.length > 0 && (
          <div className="items">
            {productAspects.map((productAspect, index) => {
                const iconType = ComponentSelectionUtil.doescomponentExistForProductAspect(productAspect, selectedComponents)
                  ? 'success'
                  : 'pending';
                return (
                  <LeftBarItem
                    key={index}
                    title={productAspect + " control set"}
                    iconType={selectedProductAspect === productAspect ? "editing" : iconType}
                    onItemClick={()=>{updateSelectedProductAspect(productAspect)}}
                    index={index}
                  />
                );
              })
            }
            <LeftBarItem
              key={productAspects.length}
              title="Summary"
              iconType="pending"
              onItemClick={()=>{}}
              index={productAspects.length}
            />
          </div>
        )}
        {(productAspects === undefined || productAspects === '' || productAspects.length === 0) &&
          <React.Fragment>
            <LeftBarItem
              key={0}
              title="Current Solution control set"
              iconType="editing"
              onItemClick={()=>{}}
              index={0}
            />
            <LeftBarItem
              key={1}
              title="Summary"
              iconType="pending"
              onItemClick={()=>{}}
              index={1}
            />
          </React.Fragment>
        }
      </div>
    );
  }
}

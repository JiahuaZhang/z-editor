import _ from 'lodash';
import { RichData } from './type';

export const prepare = (richData: RichData) => {
  richData.id = _.uniqueId();
  richData.children = richData.children?.map(prepare) ?? [];
  return richData;
};
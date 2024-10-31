import {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types/types';
import { Modal } from 'antd';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';

const Excalidraw = lazy(() => import('@excalidraw/excalidraw').then(module => ({ default: module.Excalidraw })));

export type ExcalidrawInitialElements = ExcalidrawInitialDataState['elements'];

type Props = {
  /**
   * The initial set of elements to draw into the scene
   */
  initialElements: ExcalidrawInitialElements;
  /**
   * The initial set of elements to draw into the scene
   */
  initialAppState: AppState;
  /**
   * The initial set of elements to draw into the scene
   */
  initialFiles: BinaryFiles;
  /**
   * Controls the visibility of the modal
   */
  isShown?: boolean;
  /**
   * Callback when closing and discarding the new changes
   */
  onClose: () => void;
  /**
   * Completely remove Excalidraw component
   */
  onDelete: () => void;
  /**
   * Callback when the save button is clicked
   */
  onSave: (
    elements: ExcalidrawInitialElements,
    appState: Partial<AppState>,
    files: BinaryFiles,
  ) => void;
};

export const useCallbackRefState = () => {
  const [refValue, setRefValue] = useState<ExcalidrawImperativeAPI | null>(null);
  const refCallback = useCallback((value: ExcalidrawImperativeAPI | null) => setRefValue(value), []);
  return [refValue, refCallback] as const;
};

export const ExcalidrawModal = ({ onSave, initialElements, initialAppState, initialFiles, isShown, onDelete, onClose }: Props) => {
  const [excalidrawAPI, excalidrawAPIRefCallback] = useCallbackRefState();
  const [elements, setElements] = useState<ExcalidrawInitialElements>(initialElements);
  const [files, setFiles] = useState<BinaryFiles>(initialFiles);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  useEffect(() => { if (!isShown) { setIsConfirmDelete(false); } }, [isShown]);

  const save = () => {
    if (elements && elements.filter((el) => !el.isDeleted).length > 0) {
      const appState = excalidrawAPI?.getAppState();
      // We only need a subset of the state
      const partialState: Partial<AppState> = {
        exportBackground: appState?.exportBackground,
        exportScale: appState?.exportScale,
        exportWithDarkMode: appState?.theme === 'dark',
        isBindingEnabled: appState?.isBindingEnabled,
        isLoading: appState?.isLoading,
        name: appState?.name,
        theme: appState?.theme,
        viewBackgroundColor: appState?.viewBackgroundColor,
        viewModeEnabled: appState?.viewModeEnabled,
        zenModeEnabled: appState?.zenModeEnabled,
        zoom: appState?.zoom,
      };
      onSave(elements, partialState, files);
    } else {
      onDelete();
    }
  };

  const onChange = (els: ExcalidrawInitialElements, _: AppState, fls: BinaryFiles) => {
    setElements(els);
    setFiles(fls);
  };

  return <Modal open={isShown} width={960} closable={false} onCancel={onClose}
    footer={<div un-grid='~' un-justify='end' un-grid-flow='col' >
      {
        isConfirmDelete
          ? <button un-inline='grid' un-grid-flow='col' un-items='center' un-gap='1' un-text='red-5' un-hover='text-white bg-red-5' un-border='rounded' un-p='1' un-pr='2'
            onClick={onDelete}
          >
            <span className="i-mdi:trash" un-text='lg' /> Confirm Discard
          </button>
          : <button un-inline='grid' un-grid-flow='col' un-items='center' un-gap='1' un-text='orange-6' un-hover='text-white bg-orange-6' un-border='rounded' un-p='1' un-pr='2'
            onClick={() => setIsConfirmDelete(true)}
          >
            <span className="i-mdi:close" un-text='lg' /> Discard
          </button>
      }
      <button un-inline='grid' un-grid-flow='col' un-items='center' un-gap='1' un-text='blue-6' un-hover='bg-blue-6 text-white' un-border='rounded' un-p='1' un-pr='2'
        onClick={save}
      >
        <span className="i-material-symbols-light:check" un-text='lg' /> Save
      </button>
    </div>}
  >
    <div un-h='180' >
      <Suspense>
        <Excalidraw
          onChange={onChange}
          excalidrawAPI={excalidrawAPIRefCallback}
          initialData={{
            appState: initialAppState || { isLoading: false },
            elements: initialElements,
            files: initialFiles,
          }}
        />
      </Suspense>
    </div>
  </Modal>;
};

import React from 'react';
import { Icon, InputField } from '../../common';
import { ICONS, Team } from '../../../constants';

interface WizardStep2PartSetupProps {
    newTeams: Team[];
    addingPartToTeam: string | null;
    newPartTitle: string;
    onNewPartTitleChange: (value: string) => void;
    onStartAddingPart: (teamId: string) => void;
    onAddPart: (teamId: string) => void;
    onCancelAddPart: () => void;
    onDeletePart: (teamId: string, partId: string) => void;
}

export const WizardStep2PartSetup: React.FC<WizardStep2PartSetupProps> = ({
    newTeams,
    addingPartToTeam,
    newPartTitle,
    onNewPartTitleChange,
    onStartAddingPart,
    onAddPart,
    onCancelAddPart,
    onDeletePart
}) => {
    return (
        <div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center">
                    <Icon path={ICONS.organizationChart} className="w-5 h-5 mr-2 text-sky-600" />
                    2단계: 팀에 파트 추가하기
                </h3>
                <p className="text-sm text-slate-500 mb-4">각 팀에 속할 파트들을 추가해주세요. 모든 팀에는 최소 1개의 파트가 필요합니다.</p>
                {newTeams.some(t => t.parts.length === 0) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                            <Icon path={ICONS.warningAlert} className="w-5 h-5 text-amber-600 mr-2" />
                            <span className="text-sm text-amber-800 font-medium">
                                파트가 만들어지지 않은 팀이 있습니다. 각 팀에 최소 한 개의 파트를 만들어주세요.
                            </span>
                        </div>
                    </div>
                )}
            </div>
             <div className="space-y-6">
                {newTeams.map(team => {
                    const hasNoParts = team.parts.length === 0;
                    return (
                        <div key={team.id} className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 ${
                            hasNoParts ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 hover:border-sky-300'
                        }`}>
                            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 p-5 rounded-t-xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                                            <Icon path={ICONS.buildingOffice2} className="w-6 h-6 text-sky-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-800">{team.name}</h4>
                                            <p className="text-sm text-slate-600 flex items-center">
                                                <Icon path={ICONS.userCheck} className="w-4 h-4 mr-1" />
                                                팀장: {team.lead}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                            hasNoParts 
                                                ? 'bg-amber-100 text-amber-800' 
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {team.parts.length}개 파트
                                        </span>
                                        {hasNoParts && (
                                            <div className="flex items-center text-amber-600">
                                                <Icon path={ICONS.warningAlert} className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-5">
                                <div className="space-y-3">
                                    {team.parts.map((part, index) => (
                                        <div key={part.id} className="bg-slate-50 rounded-lg p-4 flex items-center justify-between group hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-semibold text-slate-600">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{part.title}</p>
                                                    <p className="text-xs text-slate-500">파트 ID: {part.id}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => onDeletePart(team.id, part.id)} 
                                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                                                title="파트 삭제"
                                            >
                                                <Icon path={ICONS.trash} className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {addingPartToTeam === team.id ? (
                                        <div className="bg-white border-2 border-sky-300 rounded-lg p-4 space-y-4 animate-fadeIn">
                                            <div className="flex items-center mb-2">
                                                <Icon path={ICONS.plus} className="w-5 h-5 text-sky-600 mr-2" />
                                                <h5 className="font-semibold text-slate-800">새 파트 추가</h5>
                                            </div>
                                            <InputField 
                                                label="파트 이름"
                                                id="newPartTitle" 
                                                name="newPartTitle" 
                                                type="text" 
                                                value={newPartTitle} 
                                                onChange={(e) => onNewPartTitleChange(e.target.value)} 
                                                placeholder="예: 기술지원파트"
                                            />
                                             <div className="flex justify-end gap-3 pt-2">
                                                <button 
                                                    onClick={onCancelAddPart} 
                                                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                                >
                                                    취소
                                                </button>
                                                <button 
                                                    onClick={() => onAddPart(team.id)}
                                                    disabled={!newPartTitle.trim()}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                                                >
                                                    파트 생성
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => onStartAddingPart(team.id)} 
                                            className="w-full flex items-center justify-center gap-3 text-sm font-medium text-sky-600 bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100 hover:to-indigo-100 p-4 rounded-lg border-2 border-dashed border-sky-200 hover:border-sky-400 transition-all duration-200"
                                        >
                                            <Icon path={ICONS.plus} className="w-5 h-5" /> 
                                            <span>파트 추가하기</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {newTeams.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <Icon path={ICONS.buildingOffice2} className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-medium mb-2">아직 생성된 팀이 없습니다</p>
                        <p className="text-sm">이전 단계에서 팀을 먼저 만들어주세요.</p>
                    </div>
                )}
             </div>
        </div>
    );
};
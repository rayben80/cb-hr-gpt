import React from 'react';
import { Icon, InputField } from '../../common';
import { ICONS, Team } from '../../../constants';

interface WizardStep1TeamSetupProps {
    newTeams: Team[];
    isAddingTeam: boolean;
    newTeamName: string;
    newTeamLead: string;
    onNewTeamNameChange: (value: string) => void;
    onNewTeamLeadChange: (value: string) => void;
    onStartAddingTeam: () => void;
    onAddTeam: () => void;
    onCancelAddTeam: () => void;
    onDeleteTeam: (teamId: string) => void;
}

export const WizardStep1TeamSetup: React.FC<WizardStep1TeamSetupProps> = ({
    newTeams,
    isAddingTeam,
    newTeamName,
    newTeamLead,
    onNewTeamNameChange,
    onNewTeamLeadChange,
    onStartAddingTeam,
    onAddTeam,
    onCancelAddTeam,
    onDeleteTeam
}) => {
    return (
        <div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center">
                    <Icon path={ICONS.buildingOffice2} className="w-5 h-5 mr-2 text-sky-600" />
                    1단계: 새로운 팀 구성하기
                </h3>
                <p className="text-sm text-slate-500 mb-4">새로운 조직의 팀들을 생성해주세요. 팀 이름과 팀장을 입력합니다.</p>
                {newTeams.length === 0 && (
                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                            <Icon path={ICONS.plus} className="w-5 h-5 text-sky-600 mr-2" />
                            <span className="text-sm text-sky-800 font-medium">첫 번째 팀을 만들어로 시작해보세요!</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="space-y-4">
               {newTeams.map((team, index) => (
                    <div key={team.id} className="bg-gradient-to-r from-white to-slate-50 p-5 rounded-xl shadow-md border-2 border-slate-200 hover:border-sky-300 transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                                    <Icon path={ICONS.buildingOffice2} className="w-6 h-6 text-sky-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-slate-800">{team.name}</p>
                                    <p className="text-sm text-slate-600 flex items-center">
                                        <Icon path={ICONS.userCheck} className="w-4 h-4 mr-1" />
                                        팀장: {team.lead}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-full font-medium">
                                    {index + 1}번째 팀
                                </span>
                                <button 
                                    onClick={() => onDeleteTeam(team.id)} 
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                                    title="팀 삭제"
                                >
                                    <Icon path={ICONS.trash} className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    </div>
               ))}
               {isAddingTeam ? (
                    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-sky-300 space-y-4 animate-fadeIn">
                        <div className="flex items-center mb-2">
                            <Icon path={ICONS.plus} className="w-5 h-5 text-sky-600 mr-2" />
                            <h4 className="font-semibold text-slate-800">새 팀 추가</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField 
                                label="팀 이름" 
                                id="newTeamName" 
                                name="newTeamName" 
                                type="text" 
                                value={newTeamName} 
                                onChange={(e) => onNewTeamNameChange(e.target.value)} 
                                placeholder="예: 신사업팀"
                            />
                            <InputField 
                                label="팀장 이름" 
                                id="newTeamLead" 
                                name="newTeamLead" 
                                type="text" 
                                value={newTeamLead} 
                                onChange={(e) => onNewTeamLeadChange(e.target.value)} 
                                placeholder="예: 홍길동"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button 
                                onClick={onCancelAddTeam} 
                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button 
                                onClick={onAddTeam} 
                                disabled={!newTeamName || !newTeamLead}
                                className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                팀 생성
                            </button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={onStartAddingTeam} 
                        className="w-full flex items-center justify-center gap-3 text-sm font-medium text-sky-600 bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100 hover:to-indigo-100 p-4 rounded-xl border-2 border-dashed border-sky-200 hover:border-sky-400 transition-all duration-200"
                    >
                        <Icon path={ICONS.plus} className="w-5 h-5" /> 
                        <span>새 팀 추가하기</span>
                    </button>
                )}
            </div>
        </div>
    );
};
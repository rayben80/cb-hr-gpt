import React from 'react';
import { Icon } from '../../common';
import { ICONS, Team, Member } from '../../../constants';

interface WizardStep4FinalReviewProps {
    newTeams: Team[];
    unassignedMembers: Member[];
    isLoading: boolean;
}

export const WizardStep4FinalReview: React.FC<WizardStep4FinalReviewProps> = ({
    newTeams,
    unassignedMembers,
    isLoading
}) => {
    return (
        <div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center">
                    <Icon path={ICONS.checkCircle} className="w-5 h-5 mr-2 text-green-600" />
                    4단계: 최종 검토
                </h3>
                <p className="text-sm text-slate-500 mb-4">새로운 조직 구성안입니다. 검토 후 저장 버튼을 눌러 완료해주세요.</p>
                
                {/* 요약 통계 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <Icon path={ICONS.buildingOffice2} className="w-8 h-8 text-sky-600 mr-3" />
                            <div>
                                <p className="text-2xl font-bold text-sky-800">{newTeams.length}</p>
                                <p className="text-sm text-sky-600">생성된 팀</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <Icon path={ICONS.organizationChart} className="w-8 h-8 text-green-600 mr-3" />
                            <div>
                                <p className="text-2xl font-bold text-green-800">{newTeams.reduce((sum, t) => sum + t.parts.length, 0)}</p>
                                <p className="text-sm text-green-600">생성된 파트</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <Icon path={ICONS.users} className="w-8 h-8 text-purple-600 mr-3" />
                            <div>
                                <p className="text-2xl font-bold text-purple-800">{newTeams.reduce((sum, t) => sum + t.parts.reduce((pSum, p) => pSum + p.members.length, 0), 0)}</p>
                                <p className="text-sm text-purple-600">배치된 인원</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
             <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-b border-slate-200">
                    <h4 className="font-bold text-slate-800 flex items-center">
                        <Icon path={ICONS.documentText} className="w-5 h-5 mr-2 text-slate-600" />
                        새로운 조직도 미리보기
                    </h4>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-6">
                         {newTeams.map((team, teamIndex) => (
                            <div key={team.id} className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-sky-50 to-indigo-50 p-4 border-b border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <h5 className="font-bold text-lg text-slate-800 flex items-center">
                                            <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center mr-3">
                                                <span className="text-sm font-bold text-sky-600">{teamIndex + 1}</span>
                                            </div>
                                            <Icon path={ICONS.buildingOffice2} className="w-5 h-5 mr-2 text-sky-600" />
                                            {team.name}
                                        </h5>
                                        <div className="text-sm text-slate-600 bg-white px-3 py-1 rounded-full">
                                            팀장: {team.lead}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 space-y-4">
                                {team.parts.map((part, partIndex) => (
                                    <div key={part.id} className="bg-slate-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center mr-2">
                                                    <span className="text-xs font-semibold text-slate-600">{partIndex + 1}</span>
                                                </div>
                                                <p className="font-semibold text-slate-800">{part.title}</p>
                                            </div>
                                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-medium">
                                                {part.members.length}명
                                            </span>
                                        </div>
                                        {part.members.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                {part.members.map(member => (
                                                     <div key={member.id} className="flex items-center p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                                                        <img src={member.avatar} className="w-6 h-6 rounded-full mr-2" alt={member.name} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-slate-700 truncate">{member.name}</p>
                                                            <p className="text-xs text-slate-500 truncate">{member.role}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-slate-400">
                                                <Icon path={ICONS.users} className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                                <p className="text-sm">아직 배치된 인원이 없습니다</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                </div>
                            </div>
                         ))}
                         
                         {unassignedMembers.length > 0 && (
                            <div className="border-2 border-dashed border-amber-200 rounded-xl p-6 bg-amber-50">
                                <div className="text-center">
                                    <Icon path={ICONS.warningAlert} className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                                    <h6 className="font-semibold text-amber-800 mb-2">미배치 인원 {unassignedMembers.length}명</h6>
                                    <p className="text-sm text-amber-700 mb-4">아래 인원들이 아직 어떤 파트에도 배치되지 않았습니다.</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {unassignedMembers.map(member => (
                                            <div key={member.id} className="flex items-center p-2 bg-white rounded-lg border border-amber-200">
                                                <img src={member.avatar} className="w-6 h-6 rounded-full mr-2" alt={member.name} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-slate-700 truncate">{member.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{member.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                         )}
                    </div>
                </div>
                
                {/* 저장 전 경고 */}
                {!isLoading && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-t border-slate-200">
                        <div className="flex items-center justify-center">
                            <Icon path={ICONS.checkCircle} className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800">검토가 완료되면 '변경사항 저장' 버튼을 눌러주세요</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
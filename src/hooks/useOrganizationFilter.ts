import { useMemo } from 'react';
import { Team, Member as MemberType } from '../constants';

/**
 * 조직도 데이터 필터링 및 가공을 처리하는 커스텀 훅
 */
export const useOrganizationFilter = (teams: Team[], searchTerm: string, teamSearchTerm: string, teamLeadSearchTerm: string) => {
    
    // 활성/비활성 멤버 분리 및 필터링
    const { activeTeams, onLeaveMembers, resignedMembers } = useMemo(() => {
        if (import.meta.env.DEV) {
            console.log('Filtering teams:', teams);
        }
        const onLeave: MemberType[] = [];
        const resigned: MemberType[] = [];
        
        // 팀 이름과 팀 리더로 필터링
        const filteredTeams = teams.filter(team => {
            const matchesTeamName = teamSearchTerm ? team.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) : true;
            const matchesTeamLead = teamLeadSearchTerm ? team.lead.toLowerCase().includes(teamLeadSearchTerm.toLowerCase()) : true;
            return matchesTeamName && matchesTeamLead;
        });
        
        const activeTeamsData = JSON.parse(JSON.stringify(filteredTeams)).map((team: Team) => {
            team.originalTotalMemberCount = team.parts.reduce(
                (sum, part) => sum + part.members.filter(m => m.status === 'active' || m.status === 'intern').length, 
                0
            );

            team.parts = team.parts.map(part => {
                const activeAndInternMembers: MemberType[] = [];
                const originalMembers = part.members;
                part.originalMemberCount = originalMembers.filter(m => m.status === 'active' || m.status === 'intern').length;

                originalMembers.forEach(member => {
                    if (member.status === 'on_leave') {
                        onLeave.push({ 
                            ...member, 
                            teamName: team.name, 
                            partName: part.title, 
                            teamId: team.id, 
                            partId: part.id 
                        });
                    } else if (member.status === 'resigned') {
                        resigned.push({ 
                            ...member, 
                            teamName: team.name, 
                            partName: part.title, 
                            teamId: team.id, 
                            partId: part.id 
                        });
                    } else { // active or intern
                        activeAndInternMembers.push(member);
                    }
                });
                
                // 검색어로 필터링
                part.members = activeAndInternMembers.filter(m => 
                    m.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                return part;
            }).filter(part => !searchTerm || part.members.length > 0);
            
            return team;
        });
        
        if (import.meta.env.DEV) {
            console.log('Filtered active teams:', activeTeamsData);
        }
        return { 
            activeTeams: activeTeamsData, 
            onLeaveMembers: onLeave, 
            resignedMembers: resigned 
        };
    }, [teams, searchTerm, teamSearchTerm, teamLeadSearchTerm]);
    
    // 비활성 멤버 필터링
    const filteredInactiveMembers = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return {
            onLeave: onLeaveMembers.filter(m => m.name.toLowerCase().includes(lowercasedFilter)),
            resigned: resignedMembers.filter(m => m.name.toLowerCase().includes(lowercasedFilter)),
        };
    }, [onLeaveMembers, resignedMembers, searchTerm]);

    return {
        activeTeams,
        onLeaveMembers,
        resignedMembers,
        filteredInactiveMembers
    };
};
